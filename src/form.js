// ── Registro: nombre + WhatsApp (AR) + localidad → transacción con counter ─
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase.js'
import { sessionId, trackEvent, flagSession, updateSession, analyticsEvent } from './tracking.js'
import { respuestas, extrasElegidos } from './survey.js'

// Normaliza un celular argentino a E.164 (+549 + área + número, 10 dígitos).
// Acepta: "+54 9 3878 123456", "0387 15 4123456", "3878123456", etc.
export function normalizarWhatsApp(input) {
  let d = input.replace(/\D/g, '')
  if (d.startsWith('549')) d = d.slice(3)
  else if (d.startsWith('54')) d = d.slice(2)
  if (d.startsWith('9') && d.length === 11) d = d.slice(1)
  if (d.startsWith('0')) d = d.slice(1)
  // "15" después del código de área (2 a 4 dígitos) → se elimina
  if (d.length === 12) {
    for (const area of [4, 3, 2]) {
      if (d.slice(area, area + 2) === '15') {
        d = d.slice(0, area) + d.slice(area + 2)
        break
      }
    }
  }
  if (d.length !== 10 || !/^[1-3]/.test(d)) return null
  return `+549${d}`
}

export function initForm({ form, onSuccess }) {
  let localidad = null
  const chips = form.querySelectorAll('.chip[data-localidad]')
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('chip--on'))
      chip.classList.add('chip--on')
      localidad = chip.dataset.localidad
      form.querySelector('#error-localidad').textContent = ''
    })
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const nombre = form.querySelector('#nombre').value.trim()
    const telInput = form.querySelector('#whatsapp').value
    const errNombre = form.querySelector('#error-nombre')
    const errTel = form.querySelector('#error-whatsapp')
    const errLoc = form.querySelector('#error-localidad')
    errNombre.textContent = ''
    errTel.textContent = ''
    errLoc.textContent = ''

    let ok = true
    if (nombre.length < 2 || nombre.length > 80) {
      errNombre.textContent = 'Contanos tu nombre 🙂'
      ok = false
    }
    const whatsapp = normalizarWhatsApp(telInput)
    if (!whatsapp) {
      errTel.textContent = 'Revisá el número — ej: 3878 123456'
      ok = false
    }
    if (!localidad) {
      errLoc.textContent = 'Elegí tu localidad'
      ok = false
    }
    if (!ok) return

    const btn = form.querySelector('button[type=submit]')
    btn.disabled = true
    btn.textContent = 'Guardando tu lugar…'

    try {
      const founderNumber = await registrar({ nombre, whatsapp, localidad })
      trackEvent('form_submit', { localidad })
      analyticsEvent('form_submit')
      flagSession('submitted')
      updateSession({ localidad })
      onSuccess({ founderNumber, duplicado: false })
    } catch (err) {
      if (err && err.code === 'permission-denied') {
        // Casi siempre: ya existe un registro con ese WhatsApp
        onSuccess({ founderNumber: null, duplicado: true })
      } else {
        btn.disabled = false
        btn.textContent = 'Quiero mi lugar'
        errTel.textContent = 'No pudimos guardar tu registro. Probá de nuevo en un ratito.'
      }
    }
  })
}

async function registrar({ nombre, whatsapp, localidad }) {
  const counterRef = doc(db, 'public', 'counters')
  const registroRef = doc(db, 'registros', whatsapp)

  return runTransaction(db, async (tx) => {
    const counterSnap = await tx.get(counterRef)
    const founders = counterSnap.exists() ? counterSnap.data().founders : 0
    const founderNumber = founders + 1

    if (counterSnap.exists()) tx.update(counterRef, { founders: founderNumber })
    else tx.set(counterRef, { founders: 1 })

    const utm = JSON.parse(sessionStorage.getItem('solar_utm') || '{}')
    // set sobre un doc existente cuenta como update → las rules lo rechazan
    // (solo create permitido) y la transacción entera falla: anti-duplicados.
    tx.set(registroRef, {
      nombre,
      whatsapp,
      localidad,
      respuestas: { ...respuestas, extras: [...extrasElegidos] },
      founderNumber,
      session_id: sessionId,
      ...utm,
      ts: serverTimestamp(),
    })
    return founderNumber
  })
}

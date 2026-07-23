// ── Orquestación de la landing ─────────────────────────────────────────────
import './styles.css'
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase.js'
import { PRECIOS_VARIANTES } from './config.js'
import {
  startTracking, initAnalytics, trackEvent, flagSession, updateSession,
  sessionId, sessionUtm, metaCustomEvent,
} from './tracking.js'
import { renderSurvey, renderExtras } from './survey.js'
import { initForm } from './form.js'
import { initShare } from './share.js'

startTracking()
initAnalytics()

// Test de elasticidad: variante de precio al azar, fija por sesión
const VARIANTES = Object.keys(PRECIOS_VARIANTES)
let variante = sessionStorage.getItem('solar_precio_var')
if (!VARIANTES.includes(variante)) {
  variante = VARIANTES[Math.floor(Math.random() * VARIANTES.length)]
  sessionStorage.setItem('solar_precio_var', variante)
  updateSession({ precio_variante: variante })
}

const fmt = (n) => `$${n.toLocaleString('es-AR')}`
const precios = PRECIOS_VARIANTES[variante]
document.querySelector('#precio-entrada').textContent = fmt(precios.entrada)
document.querySelector('#precio-combo').textContent = fmt(precios.combo)

// Contador vivo de fundadores (public/counters)
onSnapshot(doc(db, 'public', 'counters'), (snap) => {
  const n = snap.exists() ? snap.data().founders : 0
  document.querySelectorAll('.contador-fundadores').forEach((el) => {
    el.textContent = n
    el.closest('.contador')?.classList.toggle('contador--visible', n >= 10)
  })
}, () => {})

// CTAs
const irAlForm = () => document.querySelector('#registro').scrollIntoView({ behavior: 'smooth' })

document.querySelector('#cta-hero').addEventListener('click', () => {
  trackEvent('cta_click', { cta_id: 'hero' })
  flagSession('cta_hero')
  irAlForm()
})

// ── Voto de precio: primero queda guardado en votos_precio; el pixel
// (PriceVote) se dispara recién en el éxito del guardado, nunca en el click ─
const btnSi = document.querySelector('#cta-precio')
const btnNo = document.querySelector('#voto-precio-no')
const TEXTO_SI = btnSi.textContent
const TEXTO_NO = btnNo.textContent
let votoGuardado = sessionStorage.getItem('solar_voto_precio')
let votoEnCurso = false

function pintarVotoGuardado() {
  btnSi.disabled = true
  btnNo.disabled = true
  if (votoGuardado === 'si') {
    btnSi.classList.add('cta--confirmado')
    btnSi.textContent = '¡Anotado! Sumate a la lista acá abajo 👇'
    btnNo.hidden = true
  } else {
    btnNo.textContent = 'Anotado — gracias por la sinceridad 🧡'
  }
}
if (votoGuardado) pintarVotoGuardado()

async function votarPrecio(vote) {
  if (votoGuardado || votoEnCurso) return
  votoEnCurso = true
  const btnVoto = vote === 'si' ? btnSi : btnNo
  btnSi.disabled = true
  btnNo.disabled = true
  btnVoto.textContent = 'Guardando…'
  trackEvent('cta_click', { cta_id: vote === 'si' ? 'precio' : 'precio_no', precio_variante: variante })

  try {
    // doc id = session id + rules solo-create → un voto por sesión, sin dobles
    await setDoc(doc(db, 'votos_precio', sessionId), {
      vote,
      variante,
      precio_entrada: precios.entrada,
      precio_combo: precios.combo,
      session_id: sessionId,
      ...sessionUtm,
      ts: serverTimestamp(),
    })
  } catch (err) {
    votoEnCurso = false
    if (err && err.code === 'permission-denied') {
      // Esta sesión ya votó (p. ej. en otra pestaña): cerrar la UI sin re-disparar
      votoGuardado = vote
      sessionStorage.setItem('solar_voto_precio', vote)
      pintarVotoGuardado()
    } else {
      btnSi.disabled = false
      btnNo.disabled = false
      btnSi.textContent = TEXTO_SI
      btnNo.textContent = TEXTO_NO
    }
    return
  }

  votoEnCurso = false
  votoGuardado = vote
  sessionStorage.setItem('solar_voto_precio', vote)
  metaCustomEvent('PriceVote', {
    vote,
    variante,
    precio_entrada: precios.entrada,
    precio_combo: precios.combo,
  })
  if (vote === 'si') flagSession('cta_precio')
  pintarVotoGuardado()
  if (vote === 'si') irAlForm()
}

btnSi.addEventListener('click', () => votarPrecio('si'))
btnNo.addEventListener('click', () => votarPrecio('no'))

// La sección precio entró al viewport → vio_precio (denominador de intención de pago)
new IntersectionObserver((entries, obs) => {
  if (entries.some((en) => en.isIntersecting)) {
    flagSession('vio_precio')
    obs.disconnect()
  }
}, { threshold: 0.5 }).observe(document.querySelector('#precio'))

// Encuesta
renderSurvey(document.querySelector('#encuesta-preguntas'))
renderExtras(document.querySelector('#encuesta-preguntas'))

// Formulario → pantalla de gracias
initForm({
  form: document.querySelector('#form-registro'),
  onSuccess({ founderNumber, duplicado }) {
    trackEvent('cta_click', { cta_id: 'registro' })
    document.querySelector('#registro-card').hidden = true
    const gracias = document.querySelector('#gracias')
    gracias.hidden = false
    if (duplicado) {
      gracias.querySelector('#gracias-titulo').textContent = '¡Ya estabas en la lista! 🎬'
      gracias.querySelector('#gracias-sub').textContent =
        'Ese WhatsApp ya tiene su lugar guardado en la Lista Fundadora.'
    } else {
      gracias.querySelector('#numero-fundador').textContent = `#${founderNumber}`
    }
    gracias.scrollIntoView({ behavior: 'smooth' })
  },
})

// Compartir (sección + pantalla de gracias)
initShare(document.querySelectorAll('.btn-compartir'))

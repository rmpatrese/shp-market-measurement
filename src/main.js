// ── Orquestación de la landing ─────────────────────────────────────────────
import './styles.css'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from './firebase.js'
import { PRECIOS } from './config.js'
import { startTracking, initAnalytics, trackEvent, flagSession } from './tracking.js'
import { renderSurvey, renderExtras } from './survey.js'
import { initForm } from './form.js'
import { initShare } from './share.js'

startTracking()
initAnalytics()

// Precios desde config
const fmt = (n) => `$${n.toLocaleString('es-AR')}`
document.querySelector('#precio-entrada').textContent = fmt(PRECIOS.entrada)
document.querySelector('#precio-combo').textContent = fmt(PRECIOS.combo)

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

document.querySelector('#cta-precio').addEventListener('click', (e) => {
  trackEvent('cta_click', { cta_id: 'precio' })
  flagSession('cta_precio')
  e.target.classList.add('cta--confirmado')
  e.target.textContent = '¡Anotado! Sumate a la lista acá abajo 👇'
  irAlForm()
})

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

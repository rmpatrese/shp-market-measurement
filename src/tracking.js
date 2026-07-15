// ── Instrumentación: sesiones, eventos, scroll, heartbeat, GA4/Pixel ───────
import {
  doc, setDoc, updateDoc, addDoc, collection,
  serverTimestamp, increment,
} from 'firebase/firestore'
import { db } from './firebase.js'
import { GA4_ID, META_PIXEL_ID } from './config.js'

const SID_KEY = 'solar_sid'
const UTM_KEY = 'solar_utm'
const UTM_FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']

// ── Sesión y UTMs (first-touch, persisten en sessionStorage) ───────────────
function initSession() {
  let sid = sessionStorage.getItem(SID_KEY)
  const isNew = !sid
  if (isNew) {
    sid = crypto.randomUUID()
    sessionStorage.setItem(SID_KEY, sid)
  }
  return { sid, isNew }
}

function initUtm() {
  const saved = sessionStorage.getItem(UTM_KEY)
  if (saved) return JSON.parse(saved)
  const params = new URLSearchParams(location.search)
  const utm = {}
  for (const f of UTM_FIELDS) {
    const v = params.get(f)
    if (v) utm[f] = v.slice(0, 100)
  }
  sessionStorage.setItem(UTM_KEY, JSON.stringify(utm))
  return utm
}

const { sid, isNew } = initSession()
const utm = initUtm()

export const sessionId = sid

// ── API de eventos ──────────────────────────────────────────────────────────
export function trackEvent(type, payload) {
  const data = { type, session_id: sid, ts: serverTimestamp(), ...utm }
  if (payload && Object.keys(payload).length) data.payload = payload
  addDoc(collection(db, 'events'), data).catch(() => {})
}

export function updateSession(fields) {
  updateDoc(doc(db, 'sessions', sid), fields).catch(() => {})
}

// Flags booleanos de sesión: solo false→true, una vez
const flagged = new Set()
export function flagSession(flag) {
  if (flagged.has(flag)) return
  flagged.add(flag)
  updateSession({ [flag]: true })
}

// ── Arranque: doc de sesión + page_view ────────────────────────────────────
export function startTracking() {
  if (isNew) {
    setDoc(doc(db, 'sessions', sid), {
      ts: serverTimestamp(),
      ...utm,
      seconds: 0,
      scroll_50: false,
      scroll_75: false,
      scroll_100: false,
      vio_precio: false,
      cta_hero: false,
      cta_precio: false,
      shared: false,
      submitted: false,
      survey: {},
    }).catch(() => {})
  }
  trackEvent('page_view')
  watchScroll()
  startHeartbeat()
}

// ── Scroll depth: 50 / 75 / 100 ────────────────────────────────────────────
function watchScroll() {
  const fired = new Set()
  const check = () => {
    const depth = (scrollY + innerHeight) / document.documentElement.scrollHeight
    for (const mark of [50, 75, 100]) {
      if (depth >= mark / 100 && !fired.has(mark)) {
        fired.add(mark)
        trackEvent(`scroll_${mark}`)
        flagSession(`scroll_${mark}`)
      }
    }
    if (fired.size === 3) removeEventListener('scroll', onScroll)
  }
  let ticking = false
  const onScroll = () => {
    if (ticking) return
    ticking = true
    requestAnimationFrame(() => { check(); ticking = false })
  }
  addEventListener('scroll', onScroll, { passive: true })
  check()
}

// ── Heartbeat cada 15 s (solo con pestaña visible, tope 30 min) ────────────
function startHeartbeat() {
  let beats = 0
  setInterval(() => {
    if (document.visibilityState !== 'visible' || beats >= 120) return
    beats++
    trackEvent('heartbeat_15s')
    updateSession({ seconds: increment(15) })
  }, 15000)
}

// ── GA4 + Meta Pixel: stubs que no cargan nada con IDs placeholder ─────────
const ga4Active = !GA4_ID.includes('XXXX')
const pixelActive = !META_PIXEL_ID.includes('XXXX')

export function initAnalytics() {
  if (ga4Active) {
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`
    document.head.appendChild(s)
    window.dataLayer = window.dataLayer || []
    window.gtag = function () { window.dataLayer.push(arguments) }
    window.gtag('js', new Date())
    window.gtag('config', GA4_ID)
  }
  if (pixelActive) {
    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s)
    })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
    window.fbq('init', META_PIXEL_ID)
    window.fbq('track', 'PageView')
  }
}

export function analyticsEvent(name) {
  if (ga4Active && window.gtag) window.gtag('event', name)
  if (pixelActive && window.fbq && name === 'form_submit') window.fbq('track', 'Lead')
}

// ── Compartir: Web Share API con fallback a wa.me ──────────────────────────
import { SITE_URL } from './config.js'
import { trackEvent, flagSession } from './tracking.js'

const SHARE_URL = `${SITE_URL}/?utm_source=whatsapp&utm_medium=share`
const SHARE_TEXT = `¿Te acordás de ir al cine en Orán? 🎬 Están evaluando traer un cine de estrenos de vuelta. Sumate a la Lista Fundadora y ayudá a que pase: ${SHARE_URL}`

export function initShare(buttons) {
  buttons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      trackEvent('share_click')
      flagSession('shared')
      if (navigator.share) {
        try {
          await navigator.share({ text: SHARE_TEXT })
          return
        } catch (e) {
          if (e.name === 'AbortError') return // canceló, no forzar nada
        }
      }
      open(`https://wa.me/?text=${encodeURIComponent(SHARE_TEXT)}`, '_blank', 'noopener')
    })
  })
}

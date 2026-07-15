// ── Micro-encuesta: 4 preguntas con chips + extras multi-select ────────────
import { ENCUESTA, EXTRAS } from './config.js'
import { trackEvent, updateSession } from './tracking.js'

export const respuestas = {}
export const extrasElegidos = new Set()

export function renderSurvey(container) {
  for (const pregunta of ENCUESTA) {
    const bloque = document.createElement('div')
    bloque.className = 'pregunta'
    bloque.innerHTML = `<h3>${pregunta.titulo}</h3><div class="chips" role="radiogroup" aria-label="${pregunta.titulo}"></div>`
    const chips = bloque.querySelector('.chips')

    for (const op of pregunta.opciones) {
      const chip = document.createElement('button')
      chip.type = 'button'
      chip.className = 'chip'
      chip.textContent = op.label
      chip.setAttribute('role', 'radio')
      chip.setAttribute('aria-checked', 'false')
      chip.addEventListener('click', () => {
        chips.querySelectorAll('.chip').forEach((c) => {
          c.classList.remove('chip--on')
          c.setAttribute('aria-checked', 'false')
        })
        chip.classList.add('chip--on')
        chip.setAttribute('aria-checked', 'true')
        respuestas[pregunta.q] = op.id
        trackEvent('survey_answer', { q: pregunta.q, value: op.id })
        updateSession({ [`survey.${pregunta.q}`]: op.id })
      })
      chips.appendChild(chip)
    }
    container.appendChild(bloque)
  }
}

// Multi-select: cada toggle actualiza survey.extras (array) en la sesión
export function renderExtras(container) {
  const bloque = document.createElement('div')
  bloque.className = 'pregunta'
  bloque.innerHTML = `<h3>${EXTRAS.titulo}</h3><p class="pregunta__sub">${EXTRAS.subtitulo}</p><div class="chips" role="group" aria-label="${EXTRAS.titulo}"></div>`
  const chips = bloque.querySelector('.chips')

  for (const op of EXTRAS.opciones) {
    const chip = document.createElement('button')
    chip.type = 'button'
    chip.className = 'chip'
    chip.textContent = op.label
    chip.setAttribute('aria-pressed', 'false')
    chip.addEventListener('click', () => {
      const on = !extrasElegidos.has(op.id)
      if (on) extrasElegidos.add(op.id)
      else extrasElegidos.delete(op.id)
      chip.classList.toggle('chip--on', on)
      chip.setAttribute('aria-pressed', String(on))
      trackEvent('survey_answer', { q: EXTRAS.q, value: op.id, on })
      updateSession({ 'survey.extras': [...extrasElegidos] })
    })
    chips.appendChild(chip)
  }
  container.appendChild(bloque)
}

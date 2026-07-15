// ── Micro-encuesta: chips simples o multi-select según config + extras ─────
import { ENCUESTA, EXTRAS } from './config.js'
import { trackEvent, updateSession } from './tracking.js'

// frecuencia: string · compania/horario/genero: arrays
export const respuestas = {}
export const extrasElegidos = new Set()

function chipMulti({ chips, chip, op, q, seleccion }) {
  const on = !seleccion.has(op.id)
  if (on) seleccion.add(op.id)
  else seleccion.delete(op.id)
  chip.classList.toggle('chip--on', on)
  chip.setAttribute('aria-pressed', String(on))
  trackEvent('survey_answer', { q, value: op.id, on })
  return [...seleccion]
}

export function renderSurvey(container) {
  for (const pregunta of ENCUESTA) {
    const bloque = document.createElement('div')
    bloque.className = 'pregunta'
    const rol = pregunta.multi ? 'group' : 'radiogroup'
    const hint = pregunta.multi ? ' <span class="pregunta__hint">· elegí las que quieras</span>' : ''
    bloque.innerHTML = `<h3>${pregunta.titulo}${hint}</h3><div class="chips" role="${rol}" aria-label="${pregunta.titulo}"></div>`
    const chips = bloque.querySelector('.chips')
    const seleccion = new Set()

    for (const op of pregunta.opciones) {
      const chip = document.createElement('button')
      chip.type = 'button'
      chip.className = 'chip'
      chip.textContent = op.label

      if (pregunta.multi) {
        chip.setAttribute('aria-pressed', 'false')
        chip.addEventListener('click', () => {
          respuestas[pregunta.q] = chipMulti({ chips, chip, op, q: pregunta.q, seleccion })
          updateSession({ [`survey.${pregunta.q}`]: respuestas[pregunta.q] })
        })
      } else {
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
      }
      chips.appendChild(chip)
    }
    container.appendChild(bloque)
  }
}

// Multi-select de extras: cada toggle actualiza survey.extras (array)
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
      chipMulti({ chips, chip, op, q: EXTRAS.q, seleccion: extrasElegidos })
      updateSession({ 'survey.extras': [...extrasElegidos] })
    })
    chips.appendChild(chip)
  }
  container.appendChild(bloque)
}

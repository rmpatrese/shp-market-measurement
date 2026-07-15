// ── Dashboard admin: 6 KPIs go/no-go, 2 curvas, soporte y export ───────────
import './admin.css'
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, connectAuthEmulator } from 'firebase/auth'
import {
  collection, query, where, getDocs, getCountFromServer, Timestamp,
} from 'firebase/firestore'
import { app, db } from './firebase.js'
import { UMBRALES, ENCUESTA, EXTRAS, LOCALIDADES, CREATIVIDADES } from './config.js'

const auth = getAuth(app)
if (location.hostname === 'localhost' && new URLSearchParams(location.search).has('emu')) {
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
}

const $ = (sel) => document.querySelector(sel)
const pct = (n) => `${(n * 100).toFixed(1)}%`

// ── Login ───────────────────────────────────────────────────────────────────
$('#form-login').addEventListener('submit', async (e) => {
  e.preventDefault()
  $('#error-login').textContent = ''
  try {
    await signInWithEmailAndPassword(auth, $('#email').value, $('#password').value)
  } catch {
    $('#error-login').textContent = 'Email o clave incorrectos.'
  }
})

$('#btn-logout').addEventListener('click', () => signOut(auth))

onAuthStateChanged(auth, (user) => {
  $('#login').hidden = !!user
  $('#dashboard').hidden = !user
  $('#btn-logout').hidden = !user
  if (user) cargarDashboard().catch(console.error)
})

// ── Aggregations ────────────────────────────────────────────────────────────
const count = async (col, ...conds) => {
  const snap = await getCountFromServer(conds.length ? query(collection(db, col), ...conds) : collection(db, col))
  return snap.data().count
}

let totalRegistros = 0

async function cargarDashboard() {
  $('#ultima-lectura').textContent = `Lectura: ${new Date().toLocaleString('es-AR')}`

  const frecuenciaIds = ENCUESTA.find((p) => p.q === 'frecuencia').opciones.map((o) => o.id)

  const [sesiones, registros, vioPrecio, ctaPrecio, shared, ...frecCounts] = await Promise.all([
    count('sessions'),
    count('registros'),
    count('sessions', where('vio_precio', '==', true)),
    count('sessions', where('cta_precio', '==', true)),
    count('sessions', where('shared', '==', true)),
    ...frecuenciaIds.map((id) => count('sessions', where('survey.frecuencia', '==', id))),
  ])

  totalRegistros = registros
  const frecTotal = frecCounts.reduce((a, b) => a + b, 0)
  const frecMensual = frecCounts[0] + frecCounts[1] + frecCounts[2] // 1xsem + 2xmes + 1xmes

  renderKpis([
    kpi('Conversión Lista Fundadora', sesiones ? registros / sesiones : null, UMBRALES.conversion, {
      formato: pct, detalle: `${registros} registros / ${sesiones} sesiones`,
    }),
    kpi('Intención de pago', vioPrecio ? ctaPrecio / vioPrecio : null, UMBRALES.intencion_pago, {
      formato: pct, detalle: `${ctaPrecio} clicks / ${vioPrecio} vieron precio`,
    }),
    kpi('Registros absolutos', registros, UMBRALES.registros, {
      formato: String, detalle: 'con WhatsApp validado',
    }),
    kpi('Share rate', sesiones ? shared / sesiones : null, UMBRALES.share_rate, {
      formato: pct, detalle: `${shared} compartieron / ${sesiones} sesiones`,
    }),
    kpi('Frecuencia ≥ 1×/mes', frecTotal ? frecMensual / frecTotal : null, UMBRALES.frecuencia_mensual, {
      formato: pct, detalle: `${frecMensual} de ${frecTotal} que respondieron`,
    }),
  ])

  initCpl()
  await Promise.all([renderCurvas(), renderExtras(), renderLocalidades()])
  $('#btn-soporte').addEventListener('click', cargarSoporte, { once: true })
}

function kpi(nombre, valor, umbral, { formato, detalle }) {
  let estado = 'na', etiqueta = 'SIN DATOS'
  if (valor !== null && !(umbral === UMBRALES.registros && valor === 0)) {
    const menorMejor = umbral === UMBRALES.cpl_usd
    const enGo = menorMejor ? valor <= umbral.go : valor >= umbral.go
    const enNogo = menorMejor ? valor > umbral.nogo : valor < umbral.nogo
    estado = enGo ? 'go' : enNogo ? 'nogo' : 'gris'
    etiqueta = enGo ? '✔ GO' : enNogo ? '✖ NO-GO' : '~ ZONA GRIS'
  }
  return { nombre, valor: valor === null ? '—' : formato(valor), detalle, estado, etiqueta }
}

function renderKpis(items) {
  $('#kpis').innerHTML = items.map((k) => `
    <div class="kpi">
      <div class="kpi__nombre">${k.nombre}</div>
      <div class="kpi__valor">${k.valor}</div>
      <div class="kpi__detalle">${k.detalle}</div>
      <span class="kpi__estado kpi__estado--${k.estado}">${k.etiqueta}</span>
    </div>`).join('')
}

// ── CPL (inversión manual / registros) ──────────────────────────────────────
function initCpl() {
  const input = $('#inversion')
  input.value = localStorage.getItem('solar_inversion') || ''
  const actualizar = () => {
    const inv = parseFloat(input.value)
    localStorage.setItem('solar_inversion', input.value)
    if (!inv || !totalRegistros) {
      $('#cpl-resultado').textContent = ''
      return
    }
    const cpl = inv / totalRegistros
    const k = kpi('CPL', cpl, UMBRALES.cpl_usd, { formato: (v) => `USD ${v.toFixed(2)}`, detalle: '' })
    $('#cpl-resultado').innerHTML =
      `USD ${cpl.toFixed(2)} por registro <span class="kpi__estado kpi__estado--${k.estado}">${k.etiqueta}</span>`
  }
  input.addEventListener('input', actualizar)
  actualizar()
}

// ── Curvas diarias (28 días) ────────────────────────────────────────────────
async function renderCurvas() {
  const dias = []
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  for (let i = 27; i >= 0; i--) {
    const ini = new Date(hoy); ini.setDate(hoy.getDate() - i)
    const fin = new Date(ini); fin.setDate(ini.getDate() + 1)
    dias.push({ ini, fin, label: ini.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) })
  }
  const rango = (col, d) => count(col, where('ts', '>=', Timestamp.fromDate(d.ini)), where('ts', '<', Timestamp.fromDate(d.fin)))
  const [ses, reg] = await Promise.all([
    Promise.all(dias.map((d) => rango('sessions', d))),
    Promise.all(dias.map((d) => rango('registros', d))),
  ])
  lineChart($('#curva-sesiones'), dias.map((d, i) => ({ label: d.label, value: ses[i] })), '#E8721E')
  lineChart($('#curva-registros'), dias.map((d, i) => ({ label: d.label, value: reg[i] })), '#F2A92B')
}

// Gráfico de línea SVG: una serie, 2px, grid recesivo, tooltip con crosshair
function lineChart(container, points, color) {
  const W = 640, H = 200, PAD = { t: 14, r: 14, b: 24, l: 36 }
  const max = Math.max(1, ...points.map((p) => p.value))
  const x = (i) => PAD.l + (i / (points.length - 1)) * (W - PAD.l - PAD.r)
  const y = (v) => H - PAD.b - (v / max) * (H - PAD.t - PAD.b)

  const path = points.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
  const ticks = [0, Math.round(max / 2), max]
  const grid = ticks.map((t) =>
    `<line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(t)}" y2="${y(t)}" stroke="rgba(251,246,238,0.08)" />
     <text x="${PAD.l - 6}" y="${y(t) + 3}" text-anchor="end" font-size="10" fill="#6f675c">${t}</text>`).join('')
  const ultimo = points[points.length - 1]

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Serie diaria, máximo ${max}">
      ${grid}
      <text x="${PAD.l}" y="${H - 6}" font-size="10" fill="#6f675c">${points[0].label}</text>
      <text x="${W - PAD.r}" y="${H - 6}" text-anchor="end" font-size="10" fill="#6f675c">${ultimo.label}</text>
      <path d="${path}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" />
      <circle id="marker" r="4" fill="${color}" stroke="#1A1511" stroke-width="2" style="display:none" />
      <line id="crosshair" y1="${PAD.t}" y2="${H - PAD.b}" stroke="rgba(251,246,238,0.2)" style="display:none" />
      <text x="${x(points.length - 1)}" y="${y(ultimo.value) - 8}" text-anchor="end" font-size="11" fill="#FBF6EE">${ultimo.value}</text>
      <rect id="captura" x="${PAD.l}" y="0" width="${W - PAD.l - PAD.r}" height="${H}" fill="transparent" />
    </svg>
    <div class="tooltip"></div>`

  const svg = container.querySelector('svg')
  const tooltip = container.querySelector('.tooltip')
  const marker = svg.querySelector('#marker')
  const crosshair = svg.querySelector('#crosshair')

  svg.addEventListener('mousemove', (e) => {
    const rect = svg.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const i = Math.max(0, Math.min(points.length - 1, Math.round(((px - PAD.l) / (W - PAD.l - PAD.r)) * (points.length - 1))))
    marker.setAttribute('cx', x(i)); marker.setAttribute('cy', y(points[i].value)); marker.style.display = ''
    crosshair.setAttribute('x1', x(i)); crosshair.setAttribute('x2', x(i)); crosshair.style.display = ''
    tooltip.textContent = `${points[i].label}: ${points[i].value}`
    tooltip.style.left = `${(x(i) / W) * rect.width}px`
    tooltip.style.top = `${(y(points[i].value) / H) * rect.height}px`
    tooltip.style.display = 'block'
  })
  svg.addEventListener('mouseleave', () => {
    marker.style.display = 'none'; crosshair.style.display = 'none'; tooltip.style.display = 'none'
  })
}

// ── Barras: extras y localidades ────────────────────────────────────────────
function barras(container, filas) {
  const max = Math.max(1, ...filas.map((f) => f.valor))
  container.innerHTML = filas.map((f) => `
    <div class="barra">
      <span>${f.label}</span>
      <div class="barra__pista"><div class="barra__fill" style="width:${(f.valor / max) * 100}%"></div></div>
      <span class="barra__valor">${f.valor}</span>
    </div>`).join('')
}

async function renderExtras() {
  const valores = await Promise.all(
    EXTRAS.opciones.map((o) => count('sessions', where('survey.extras', 'array-contains', o.id))),
  )
  barras($('#barras-extras'), EXTRAS.opciones.map((o, i) => ({ label: o.label, valor: valores[i] })))
}

async function renderLocalidades() {
  const valores = await Promise.all(
    LOCALIDADES.map((l) => count('registros', where('localidad', '==', l.id))),
  )
  barras($('#barras-localidades'), LOCALIDADES.map((l, i) => ({ label: l.label, valor: valores[i] })))
}

// ── Soporte: lectura completa de sesiones + registros ───────────────────────
let registrosDocs = []

async function cargarSoporte() {
  $('#btn-soporte').textContent = 'Cargando…'
  const [sesSnap, regSnap] = await Promise.all([
    getDocs(collection(db, 'sessions')),
    getDocs(collection(db, 'registros')),
  ])
  const sesiones = sesSnap.docs.map((d) => d.data())
  registrosDocs = regSnap.docs.map((d) => d.data())

  const secs = sesiones.map((s) => s.seconds || 0).sort((a, b) => a - b)
  const mediana = secs.length ? secs[Math.floor(secs.length / 2)] : 0
  const n = sesiones.length || 1
  const share = (flag) => pct(sesiones.filter((s) => s[flag]).length / n)

  $('#kpis-soporte').innerHTML = [
    ['Mediana permanencia', `${mediana}s`, 'sano: > 45s'],
    ['Scroll 50%', share('scroll_50'), ''],
    ['Scroll 75%', share('scroll_75'), 'sano: > 50%'],
    ['Vieron precio', share('vio_precio'), ''],
    ['Click precio', share('cta_precio'), ''],
    ['Registraron', share('submitted'), ''],
  ].map(([nombre, valor, detalle]) => `
    <div class="kpi">
      <div class="kpi__nombre">${nombre}</div>
      <div class="kpi__valor">${valor}</div>
      <div class="kpi__detalle">${detalle}</div>
    </div>`).join('')

  // Conversión por utm_content
  const porUtm = {}
  const clave = (v) => v || '(orgánico)'
  for (const s of sesiones) {
    const k = clave(s.utm_content)
    porUtm[k] = porUtm[k] || { ses: 0, reg: 0 }
    porUtm[k].ses++
  }
  for (const r of registrosDocs) {
    const k = clave(r.utm_content)
    porUtm[k] = porUtm[k] || { ses: 0, reg: 0 }
    porUtm[k].reg++
  }
  const orden = [...CREATIVIDADES, ...Object.keys(porUtm).filter((k) => !CREATIVIDADES.includes(k))]
  $('#tabla-utm tbody').innerHTML = orden
    .filter((k) => porUtm[k])
    .map((k) => {
      const { ses, reg } = porUtm[k]
      return `<tr><td>${k}</td><td>${ses}</td><td>${reg}</td><td>${ses ? pct(reg / ses) : '—'}</td></tr>`
    }).join('')

  $('#soporte').hidden = false
  $('#btn-soporte').hidden = true
  $('#btn-csv').addEventListener('click', descargarCsv, { once: true })
}

function descargarCsv() {
  const filas = [['founder', 'nombre', 'whatsapp', 'localidad', 'fecha', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'frecuencia', 'compania', 'horario', 'genero', 'extras']]
  for (const r of [...registrosDocs].sort((a, b) => (a.founderNumber || 0) - (b.founderNumber || 0))) {
    const resp = r.respuestas || {}
    filas.push([
      r.founderNumber, r.nombre, r.whatsapp, r.localidad,
      r.ts?.toDate ? r.ts.toDate().toLocaleString('es-AR') : '',
      r.utm_source || '', r.utm_medium || '', r.utm_campaign || '', r.utm_content || '',
      resp.frecuencia || '', resp.compania || '', resp.horario || '', resp.genero || '',
      (resp.extras || []).join('|'),
    ])
  }
  const csv = '\uFEFF' + filas.map((f) => f.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  a.download = `solar-registros-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

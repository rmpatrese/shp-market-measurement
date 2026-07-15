// ── Configuración central de SOLAR fake-door ──────────────────────────────
// Todo lo que se toca antes de lanzar está en este archivo.

// URL canónica (dominio propio conectado en Firebase Hosting)
export const SITE_URL = 'https://cineoran.com'

export const firebaseConfig = {
  apiKey: 'AIzaSyB1OGDSwa3Q1kMrFzhiANxQrljjJ3ISUL8',
  authDomain: 'shp-market-measurement.firebaseapp.com',
  projectId: 'shp-market-measurement',
  storageBucket: 'shp-market-measurement.firebasestorage.app',
  messagingSenderId: '38422068154',
  appId: '1:38422068154:web:9cfc394ebd459e780dfb83',
}

// Base con nombre (decisión del 2026-07-15; ojo: el tier gratuito es solo de la default)
export const FIRESTORE_DB_ID = 'db-shp-market-measurement'

// IDs de analítica — reemplazar por los reales antes de lanzar la pauta.
// Mientras contengan 'XXXX' los loaders no cargan nada (stub).
export const GA4_ID = 'G-XXXXXXXXXX'
export const META_PIXEL_ID = 'XXXXXXXXXXXXXXX'

// ⚠️ PRECIOS DE REFERENCIA — reemplazar por los definitivos antes de lanzar.
export const PRECIOS = {
  entrada: 8000,
  combo: 10000,
}

export const LOCALIDADES = [
  { id: 'oran', label: 'Orán' },
  { id: 'pichanal', label: 'Pichanal' },
  { id: 'hipolito_yrigoyen', label: 'H. Yrigoyen' },
  { id: 'colonia_santa_rosa', label: 'C. Santa Rosa' },
  { id: 'otro', label: 'Otro' },
]

export const ENCUESTA = [
  {
    q: 'frecuencia',
    titulo: '¿Cada cuánto irías?',
    opciones: [
      { id: '1xsem', label: '1 vez por semana' },
      { id: '2xmes', label: '2 veces al mes' },
      { id: '1xmes', label: '1 vez al mes' },
      { id: 'casi_nunca', label: 'Casi nunca' },
    ],
  },
  {
    q: 'compania',
    titulo: '¿Con quién irías?',
    opciones: [
      { id: 'familia', label: 'Familia con chicos' },
      { id: 'pareja', label: 'En pareja' },
      { id: 'amigos', label: 'Con amigos' },
      { id: 'solo', label: 'Solo/a' },
    ],
  },
  {
    q: 'horario',
    titulo: '¿En qué horario?',
    opciones: [
      { id: 'matine', label: 'Matiné' },
      { id: 'tarde', label: 'Tarde' },
      { id: 'noche', label: 'Noche' },
      { id: 'trasnoche', label: 'Trasnoche finde' },
    ],
  },
  {
    q: 'genero',
    titulo: '¿Qué película te mueve?',
    opciones: [
      { id: 'estreno_tanque', label: 'Acción / estreno tanque' },
      { id: 'infantil', label: 'Infantil' },
      { id: 'terror', label: 'Terror' },
      { id: 'cine_argentino', label: 'Cine argentino' },
    ],
  },
]

// "¿Qué más te gustaría que haya?" — multi-select (mide demanda de otros rubros)
export const EXTRAS = {
  q: 'extras',
  titulo: '¿Qué más te gustaría que haya?',
  subtitulo: 'Podés elegir varias — nos ayuda a pensar el lugar completo.',
  opciones: [
    { id: 'bowling', label: 'Bowling' },
    { id: 'juegos', label: 'Juegos tipo Sacoa / Neverland' },
    { id: 'patio_comidas', label: 'Patio de comidas' },
    { id: 'cafeteria', label: 'Cafetería / heladería' },
    { id: 'salon_eventos', label: 'Salón para cumples y eventos' },
    { id: 'solo_cine', label: 'Con el cine me alcanza' },
  ],
}

// utm_content de las creatividades de Meta Ads (para la tabla del admin).
export const CREATIVIDADES = ['nostalgia', 'render_sala', 'precio_combo', 'testimonios']

// Umbrales go/no-go de la tabla §3 del plan.
export const UMBRALES = {
  conversion: { go: 0.10, nogo: 0.05 },
  intencion_pago: { go: 0.25, nogo: 0.15 },
  registros: { go: 400, nogo: 200 },
  cpl_usd: { go: 0.80, nogo: 1.50 }, // acá menor es mejor
  share_rate: { go: 0.08, nogo: 0.04 },
  frecuencia_mensual: { go: 0.60, nogo: 0.40 },
}

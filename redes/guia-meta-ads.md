# Guía: Facebook + Instagram + Meta Ads para SOLAR

Estado al 2026-07-15: píxel **CINE ORAN** (`913223684399223`) creado y activo en
cineoran.com (PageView funcionando, Lead se dispara con cada registro). Assets de
marca en esta carpeta: `perfil-1080.png` y `portada-fb-1640x856.png`.

## 1 · Página de Facebook (15 min)

1. facebook.com/pages/create (o Business Suite → Crear página).
2. **Nombre:** `SOLAR` · **Categoría:** Cine / Entretenimiento.
3. **Nombre de usuario:** intentar `@solar.oran` (si está tomado: `@cineoran`).
4. **Biografía:** `¿Y si el cine vuelve a Orán? Ayudanos a decidir 👉 cineoran.com`
5. **Foto de perfil:** `perfil-1080.png` · **Portada:** `portada-fb-1640x856.png`
6. **Botón de la página:** "Más información" → `https://cineoran.com/?utm_source=facebook&utm_medium=organic&utm_campaign=validacion`

## 2 · Instagram (10 min)

1. Crear cuenta `@solar.oran` → Configuración → cambiar a **cuenta profesional (Empresa)**.
2. Misma foto de perfil. **Bio:** `🎬 ¿Y si el cine vuelve a Orán? · Vos decidís` +
   link `https://cineoran.com/?utm_source=instagram&utm_medium=organic&utm_campaign=validacion`
3. Vincular a la página: Business Suite → Configuración → Cuentas → Instagram → Conectar.

## 3 · Meta Business Manager (20 min)

En **business.facebook.com → Configuración del negocio**:

1. **Cuentas → Páginas:** agregar la página SOLAR.
2. **Cuentas → Cuentas publicitarias → Crear:** nombre `SOLAR Ads`,
   zona horaria `America/Argentina/Salta`, moneda ARS.
   ⚠️ Pagando en ARS con tarjeta argentina se suman IVA y percepciones (~75% extra
   sobre el gasto) — tenerlo en cuenta en el presupuesto.
3. **Método de pago:** cargar tarjeta.
4. **Orígenes de datos → Píxeles:** verificar que CINE ORAN esté conectado a la
   cuenta publicitaria nueva.
5. **Brand Safety → Dominios → Agregar → cineoran.com** → elegir verificación por
   **metaetiqueta** → copiar el código `content="..."` y pasárselo a Claude, que lo
   agrega a la página y deploya. Después tocar "Verificar".
6. **Administrador de eventos → píxel CINE ORAN → Medición de eventos agregados:**
   configurar `Lead` como evento prioritario del dominio (post-iOS14).

## 4 · La campaña (según §4 del plan de validación)

**Ads Manager → Crear campaña:**

| Campo | Valor |
|---|---|
| Objetivo | **Clientes potenciales (Leads)** |
| Conversión | Sitio web · Evento: **Lead** (píxel CINE ORAN) |
| Presupuesto | USD 200–300 totales en 4 semanas ≈ USD 7–10/día equivalente en ARS |
| Ubicación | 📍 pin en San Ramón de la Nueva Orán + **radio 30 km** · "Personas que viven en este lugar" |
| Edad | 16–55 |
| Intereses | **NINGUNO** (el geo ya filtra; la audiencia es chica) |
| Ubicaciones | Advantage+ automáticas (FB + IG) |

**Anuncios: 3–4 creatividades, cada una con SU url** (el `utm_content` ya está
precargado en el dashboard para atribuir conversión por creatividad):

- Nostalgia ("Orán tuvo 5 cines…"):
  `https://cineoran.com/?utm_source=meta&utm_medium=cpc&utm_campaign=validacion&utm_content=nostalgia`
- Render de la sala ("así sería"):
  `https://cineoran.com/?utm_source=meta&utm_medium=cpc&utm_campaign=validacion&utm_content=render_sala`
- Precio del combo ("estrenos + pochoclos a $X"):
  `https://cineoran.com/?utm_source=meta&utm_medium=cpc&utm_campaign=validacion&utm_content=precio_combo`
- Testimonios / prueba social ("ya somos N"):
  `https://cineoran.com/?utm_source=meta&utm_medium=cpc&utm_campaign=validacion&utm_content=testimonios`

**Regla de corte:** al día 4, apagar toda creatividad con CPL > 2× la mejor.
El CPL se ve en Ads Manager ("Costo por resultado") y en `cineoran.com/admin`
cargando la inversión acumulada.

## 5 · Orgánico semana 1 (nostalgia)

- Post carrusel: "Orán tuvo 5 cines. Hoy no tiene ninguno." — pedir fotos viejas a
  la gente en los comentarios (alcance orgánico + material para semana 2).
- Story con encuesta: "¿Te acordás de ir al cine en Orán?" (Sí, obvio / No llegué).
- Compartir en los grupos de Facebook de compra-venta y noticias de Orán (gratis y
  potente): mismo link con `utm_source=facebook&utm_medium=grupos`.

## Calendario completo

Semana 1 nostalgia → Semana 2 el sueño concreto (renders) → Semana 3 la gente
decide (contador público + concurso) → Semana 4 urgencia honesta ("última semana
de la medición"). Detalle en `solar_plan_validacion_fakedoor.md` §4.

# SOLAR — Plan de Validación (Fake-Door) · Orán

## 0. El principio que ordena todo

El tiempo de permanencia y los clicks son KPIs de soporte, no de decisión. En un pueblo de 86.000 habitantes cualquier novedad genera curiosidad y tráfico; lo que decide si se construye un cine es la **señal de plata**: cuánta gente avanza sobre un CTA con precio visible y deja un dato de contacto verificable. La jerarquía es:

1. **KPI de decisión:** intención de pago (click en CTA con precio + registro con WhatsApp).
2. **KPI de demanda:** conversión de visita a "Lista Fundadora".
3. **KPIs de soporte:** tiempo, scroll, CTR por CTA, share rate — sirven para diagnosticar *por qué* convierte o no, nunca para declarar éxito.

## 1. Encuadre ético (importante en una ciudad chica)

No prometer funciones que no existen. El framing correcto y honesto: **"Estamos evaluando traer un cine de estrenos a Orán. Sumate a la Lista Fundadora y ayudanos a decidir."** Esto mide lo mismo, no quema la marca SOLAR si el proyecto no avanza, y convierte a los registrados en base de lanzamiento si avanza. En Orán todo se sabe: un fake-door engañoso se paga después en boletería.

## 2. La webapp (mobile-first, una sola página con scroll)

**Estructura de pantallas (secciones):**

1. **Hero** — logo SOLAR, claim ("El cine vuelve a Orán" / subtítulo "Ayudanos a hacerlo realidad"), CTA primario `Quiero mi lugar en la Lista Fundadora`. Fondo con render/imagen de sala.
2. **Qué va a haber** — 3 tarjetas: estrenos el mismo día que Buenos Aires · sala 3D con sonido envolvente · candy bar. Micro-copy corto, visual.
3. **Precio de referencia** — "Entrada estimada: $X.XXX · Combo pochoclo + bebida: $X.XXX" con CTA secundario `A ese precio, cuento conmigo` (este click es la señal de intención de pago).
4. **Micro-encuesta (4 preguntas, chips tocables, sin teclado):**
   - ¿Cada cuánto irías? (1×/sem · 2×/mes · 1×/mes · casi nunca)
   - ¿Con quién? (familia con chicos · pareja · amigos · solo)
   - ¿Qué horario? (matiné · tarde · noche · trasnoche finde)
   - ¿Qué tipo de película te mueve? (acción/estreno tanque · infantil · terror · cine argentino)
5. **Registro** — nombre + WhatsApp (obligatorio) + barrio/localidad (selector: Orán · Pichanal · H. Yrigoyen · C. Santa Rosa · otro). Sin email obligatorio: en el NOA el WhatsApp es el dato real.
6. **Compartir** — botón `Invitá a alguien que extrañe el cine` (share nativo a WhatsApp). El share rate es el proxy de demanda orgánica más barato que existe.
7. **Gracias** — número de fundador asignado ("Sos el fundador #247") — refuerza prueba social y da un contador honesto.

**Branding:** tokens del archivo `Marca Solar v2.dc.html` (Claude Design). El link compartido requiere login y no es accesible desde afuera: **exportar el HTML desde Claude Design y adjuntarlo** en el chat de construcción. Mientras tanto, la webapp se estructura con variables CSS en un solo bloque `:root` para que el swap de marca tome minutos.

## 3. Instrumentación y KPIs

**Stack:** Firebase Hosting + Firestore (proyecto de Firebase **nuevo y separado** del ERP de la farmacia — no mezclar datos ni cuotas con `dv02-srrdf`) + GA4 + Meta Pixel (necesario para optimizar la pauta a conversión, no solo a tráfico).

**Esquema de eventos (colección `events`):** `page_view` (con UTM completos), `scroll_50 / scroll_75 / scroll_100`, `heartbeat_15s` (para tiempo real de permanencia, no el de GA), `cta_click {cta_id: hero | precio | registro}`, `survey_answer {q, value}`, `form_submit`, `share_click`. Cada evento con `session_id`, `timestamp`, `utm_source/medium/campaign/content`.

**KPIs y umbrales de decisión (ventana: 4 semanas, objetivo 2.500–5.000 visitas):**

| KPI | Definición | GO | Zona gris | NO-GO |
|---|---|---|---|---|
| Conversión Lista Fundadora | form_submit / visitas únicas | ≥ 10% | 5–10% | < 5% |
| Intención de pago | click CTA-precio / quienes vieron la sección precio | ≥ 25% | 15–25% | < 15% |
| Registros absolutos | form_submit con WhatsApp válido | ≥ 400 | 200–400 | < 200 |
| CPL en Meta | inversión / form_submit | ≤ USD 0,80 | 0,80–1,50 | > 1,50 |
| Share rate | share_click / visitas únicas | ≥ 8% | 4–8% | < 4% |
| Frecuencia declarada | % que responde ≥ 1×/mes | ≥ 60% | 40–60% | < 40% |

KPIs de soporte (diagnóstico): mediana de permanencia (sano: > 45 s), scroll_75 (> 50%), drop-off por sección, mix de localidades (si > 25% viene de fuera de Orán ciudad, el área de influencia es real).

Regla de lectura: **2+ KPIs de decisión en NO-GO = no se construye**, sin importar cuán lindos estén los de soporte. Todo en verde = pasar a Fase 1 del plan de negocio. Zona gris = extender 2 semanas con creatividades nuevas o correr la validación física (§5).

**Dashboard:** export de Firestore a Looker Studio (o una vista admin simple `/admin` protegida). Nada elaborado: 6 números y 2 curvas.

## 4. Plan Instagram + Facebook (4 semanas)

**Setup:** cuenta `@solar.oran` en IG + página FB espejo. Bio: "¿Y si el cine vuelve a Orán? Ayudanos a decidir 👉 link". Identidad visual 100% desde el brand file SOLAR. FB pesa más que IG en el NOA para +30 y familias: no tratarlo como espejo de segunda.

**Contenido orgánico (3 posts/semana + stories diarias):**
- *Semana 1 — Nostalgia:* "Orán tuvo 5 cines. Hoy no tiene ninguno." Carrusel con historia de los cines de Orán (material de archivo local, pedir fotos a la gente — genera comentarios y alcance orgánico). Story con encuesta "¿Te acordás de ir al cine en Orán?"
- *Semana 2 — El sueño concreto:* renders/mockups de la sala, "así sería", el candy bar, los estrenos día-y-fecha con Buenos Aires. CTA a la web.
- *Semana 3 — La gente decide:* contador público de fundadores ("Ya somos 320"), testimonios de comentarios, concurso "¿Qué película estrenarías en la primera función?" (comentar + compartir).
- *Semana 4 — Urgencia honesta:* "Última semana de la medición. Si Orán quiere cine, es ahora." Recap de números.

**Pauta (Meta Ads):** presupuesto USD 200–300 total. Objetivo: conversiones (form_submit vía Pixel), no tráfico. Segmentación: geo Orán + 30 km, 16–55, sin intereses (el geo ya filtra; la audiencia es chica y los intereses la asfixian). 3–4 creatividades en test A/B (nostalgia vs. render de sala vs. precio del combo), cada una con su `utm_content` para atribuir. Regla: matar toda creatividad con CPL > 2× la mejor a los 4 días.

**Amplificador local (gratis y potente en Orán):** grupos de Facebook de compra-venta y noticias de Orán, radios locales (nota de color: "un oranense quiere traer el cine de vuelta"), y el WhatsApp share de la propia webapp.

## 5. Validación física opcional (si los KPIs quedan en zona gris)

Funciones pop-up: alquilar el auditorio de la Casa de la Cultura (o el club) 2 fines de semana, proyección legal de un título licenciable + candy improvisado, entrada paga real. Mide lo único que el fake-door no mide: si la gente se levanta del sillón y paga. 200 entradas vendidas a precio real vale más que 5.000 visitas web.

## 6. Prompt de handoff para Claude Code (copiar y pegar)

**Preparación:** crear una carpeta nueva (p. ej. `~/solar-fakedoor`), **fuera del repo del ERP** — proyecto limpio, sin CLAUDE.md ni contexto heredado de la farmacia. Copiar adentro este documento y el HTML exportado de `Marca Solar v2.dc.html` (Claude Code tampoco puede abrir el link de Claude Design: la exportación es manual). Abrir Claude Code en esa carpeta y pegar:

```
Construí una webapp fake-door de validación llamada "SOLAR — El cine vuelve a Orán",
lista para deployar en Firebase Hosting. La especificación completa está en
./solar_plan_validacion_fakedoor.md (secciones 1, 2 y 3 son la spec) y el branding
en el archivo ./Marca Solar v2.dc.html.

Requisitos técnicos:
- Single-page, mobile-first (diseñar a 390px, fluida hasta desktop). Stack simple:
  Vite + vanilla JS o React, un solo build deployable.
- Branding: extraer colores, tipografías y logo del HTML de marca y volcarlos a
  variables CSS en :root.
- Copy en español argentino, tono cercano, framing honesto de "estamos evaluando"
  (nunca prometer funciones existentes).
- Instrumentación: Firestore con el esquema de eventos de la sección 3 del documento
  (page_view con UTMs, scroll_50/75/100, heartbeat_15s, cta_click, survey_answer,
  form_submit, share_click; todos con session_id y timestamp). El proyecto Firebase
  es NUEVO — lo creo yo en la consola y te paso el firebaseConfig; no usar dv02-srrdf.
  GA4 y Meta Pixel como stubs con placeholders de ID.
- Reglas de seguridad de Firestore: escritura pública solo en events y registros,
  con validación de esquema y tamaño; lectura pública únicamente del contador de
  fundadores; todo lo demás cerrado.
- Formulario: nombre + WhatsApp (validar formato AR +54) + localidad (chips).
  Anti-duplicados por WhatsApp. Contador de fundadores real desde Firestore.
- Botón de compartir con Web Share API (fallback: link wa.me con texto prearmado).
- Ruta /admin protegida por clave simple: totales de cada KPI de la tabla de la
  sección 3 y conversión por utm_content.
- Entregar: código + firebase.json + .firebaserc + firestore.rules + pasos de
  deploy (yo manejo la CLI de Firebase).
```

## 7. Secuencia de ejecución

Semana 0: exportar brand file → construir webapp con Claude Code → deploy en Firebase Hosting con dominio (`solaroran.com` o subdominio) → configurar Pixel + GA4. Semanas 1–4: campaña según §4, revisión de KPIs cada lunes. Semana 5: lectura go/no-go contra la tabla de §3 y decisión documentada.

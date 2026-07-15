# SOLAR — El cine vuelve a Orán (fake-door)

Webapp de validación de demanda según `solar_plan_validacion_fakedoor.md`.
Stack: Vite + vanilla JS · Firebase Hosting + Firestore · GitHub Actions.

## Comandos

```bash
npm install            # dependencias
npm run dev            # dev server (agregar ?emu a la URL para usar el emulador)
npm run emulators      # emuladores de Firestore + Auth + Hosting
npm run build          # build a dist/
```

## Deploy

**Automático:** cada push a `main` buildea y deploya hosting + reglas de Firestore
(workflow `.github/workflows/deploy.yml`). Los PRs generan un canal de preview con
URL temporal (7 días).

Autenticación **sin claves** por Workload Identity Federation: el pool `github` /
provider `github-oidc` del proyecto acepta OIDC solo del repo
`rmpatrese/shp-market-measurement` e impersona al service account
`github-deploy@shp-market-measurement.iam.gserviceaccount.com` (rol Firebase Admin).
No hay secrets que rotar.

**Manual (fallback):**

```bash
npm run build
npx -y firebase-tools@latest deploy --project shp-market-measurement
```

## Configuración previa al lanzamiento

Todo vive en `src/config.js`:

- **PRECIOS** ⚠️ — poner los definitivos antes de lanzar (hoy hay placeholders).
- **GA4_ID / META_PIXEL_ID** — mientras contengan `XXXX` los loaders no cargan nada.
- **CREATIVIDADES** — los `utm_content` de las creatividades de Meta Ads.

Pendiente de diseño: `public/og.png` (1200×630) para la preview al compartir en
WhatsApp/Facebook — usar un render de la sala con el logo.

## Dominio cineoran.com

1. Consola de Firebase → Hosting → **Agregar dominio personalizado** → `cineoran.com`
   (marcar también `www.cineoran.com` con redirect).
2. Firebase da un registro **TXT** (verificación) y dos registros **A** — cargarlos
   en el DNS del registrador donde se compró el dominio.
3. Esperar la verificación + certificado SSL (minutos a horas).
4. En Authentication → Settings → **Authorized domains**, agregar `cineoran.com`
   (necesario para el login del admin desde el dominio propio).

## Firestore

- Base **con nombre** `db-shp-market-measurement`, modo producción, región
  `southamerica-east1`. ⚠️ El tier gratuito de Firestore aplica solo a la base
  `(default)`: esta base factura todo uso (a escala de la validación son centavos,
  pero conviene mirar la facturación).
- Colecciones: `sessions` (una por visita, con flags de KPI), `events` (log crudo),
  `registros` (doc id = WhatsApp E.164, anti-duplicados), `public/counters`
  (contador de fundadores, lectura pública, se auto-crea con el primer registro).
- Reglas: `firestore.rules` — escritura pública validada por esquema, lectura solo
  para el UID admin.

## Dashboard

`https://cineoran.com/admin` — login con el usuario de Firebase Auth (Email/Password).
Muestra los KPIs go/no-go de la tabla §3 del plan, curvas diarias, interés en extras
(bowling, juegos, patio de comidas…), conversión por creatividad y export CSV de
registros. La inversión de Meta se carga a mano para calcular CPL.

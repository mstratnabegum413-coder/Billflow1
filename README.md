# BillFlow - Invoice Studio

Fast, clean invoicing for freelancers and small businesses. Create invoices, see Paid / Outstanding / Overdue at a glance, and print or save PDFs. Works offline. No account, no server, no tracking.

## Screenshots
| Dashboard (light) | Dashboard (dark) |
|---|---|
| ![Dashboard light](docs/screenshots/1-dashboard-light.png) | ![Dashboard dark](docs/screenshots/2-dashboard-dark.png) |

| Invoice editor with live preview | Print layout (Save as PDF) |
|---|---|
| ![Editor](docs/screenshots/3-invoice-editor.png) | ![Print layout](docs/screenshots/4-print-layout.png) |

## Five differentiating features
1. Live paper preview that updates as you type (`js/sheet.js`, `js/views/edit.js`, `js/views/edit-items.js`)
2. Automatic overdue detection and dashboard totals (`js/invoice-calc.js`: `status`, `summarise`)
3. Offline-ready installable PWA (`service-worker.js`, `manifest.webmanifest`)
4. JSON backup and restore with validation and unique ids (`js/backup.js`)
5. Print-optimised layout (`@media print`) plus light and dark themes (`styles.css`)

Also: 8 currencies, tax and discount, automatic invoice numbers, duplicate, delete and a sample data loader.

## Setup steps (the same steps, in full, are in HowToSetup.md)
**Prerequisites:** Node.js **20 or newer** (tested on 22) for the local server and tests, a current browser, and HTTPS or `localhost` for offline mode. Python is not needed. The app folder is named `Web App` (with a space), so quote it in shell commands.

**Target 1 - run locally**
1. `npm start` serves `Web App` on http://127.0.0.1:8080
2. `npm test` runs the tax, numbering, summary, storage and backup tests
3. `npm run check` checks syntax and verifies the service worker `ASSETS` list against the files in `Web App`

**Target 2 - GitHub Pages**
1. Create a public repository and upload the contents of `Web App` (not the folder itself) to the repository root
2. Settings -> Pages -> Deploy from a branch -> `main` -> `/ (root)` -> Save
3. Open `https://YOUR-NAME.github.io/REPO-NAME/`

**Other targets:** Cloudflare Pages or Netlify (publish directory `Web App`, no build command), a VPS with nginx (copy `Web App` to the web root and add HTTPS with Certbot), or Docker: `docker run -d -p 8080:80 -v "$PWD/Web App":/usr/share/nginx/html:ro nginx:alpine`.

**Sample data:** press **Load sample data** on an empty dashboard.
**Branding:** business details on the Profile page; colours in the CSS variables at the top of `Web App/styles.css`; currencies and statuses in `Web App/js/config.js`.
**Offline check:** open the site once, DevTools -> Application -> Service Workers shows `service-worker.js` activated, then Network -> Offline -> reload; the app still loads. After changing a shipped file, add it to `ASSETS` and bump `CACHE` in `Web App/service-worker.js`. The manifest uses `start_url` and `scope` of `./`.

## Data safety
BillFlow is a **single-user, device-local** app. Invoices live in the browser's localStorage (key `billflow.v1`, schema version 2). There is no login or password: anyone who can open the browser profile can read and edit the invoices. Clearing browser data erases them, so export a backup regularly. It is not multi-user software.

**Storage limit:** browsers allow about 5 MB of localStorage per site (the exact limit varies by browser). One invoice takes roughly 1 KB, so thousands of invoices fit. If the browser refuses to save, BillFlow shows a message instead of losing data silently: export a backup and clear old invoices. Data is stored unencrypted, so avoid sensitive client data on shared devices.

## Audit and architecture notes
- `.env.example` documents the optional local preview server settings. The production app requires no environment variables or secrets.
- `database/schema.sql` and `database/seed.sql` provide an optional SQLite reference schema and demo data for audit/migration planning. They are **not connected** to this static app; runtime data remains in browser `localStorage`.
- The app has no backend, API, accounts or mutating endpoints, so server-side authentication and endpoint roles are not applicable. See `SECURITY.md` and `database/README.md`.
- Live demo: https://mstratnabegum413-coder.github.io/Billflow1/

## Dependencies
**Zero dependencies.** No npm packages and no CDN scripts, so no lockfile is needed. `package.json` declares empty dependencies and `"engines": {"node": ">=20"}` (Node is only for the local server and tests).

## Project map
    Web App/index.html, styles.css, app.js (bootstrap), service-worker.js, manifest.webmanifest, icon.svg
    Web App/js/config.js          currencies, statuses, timings, messages
    Web App/js/invoice-calc.js    totals, status, numbering, summaries, line-item helpers (tested)
    Web App/js/storage.js         all localStorage access, schema version, migration, ids
    Web App/js/backup.js          JSON export and import with validation
    Web App/js/sample-data.js     demo fixtures
    Web App/js/ui.js, state.js, sheet.js   helpers, saved data, printable invoice
    Web App/js/views/             home.js, edit.js, edit-items.js, profile.js
    Web App/js/router.js          hash router
    scripts/serve.js, check.js    local server (127.0.0.1 only) and checks
    tests/                        invoice-calc.test.js, data.test.js

## Version history (details in CHANGELOG.md)
- **1.0.6** (2026-11-03): safer data migration and backup validation, local timezone date handling, hardened local preview server, audit support files.
- **1.0.5** (2026-11-03): line-item rendering split into `edit-items.js`, data-driven profile form, local server bound to 127.0.0.1, Node 20+
- **1.0.4** (2026-11-03): storage-limit notes, unencrypted-data warning on Profile, `ASSETS` check in `npm run check`
- **1.0.3** (2026-11-02): modular code, schema version and migration, unique ids, offline cache list, full setup guide
- **1.0.0** (2026-10-30): first release with dashboard, invoice editor with live preview, tax and discount, 8 currencies, profile, print layout, light and dark themes, JSON backup and restore, sample data, offline PWA, tax and discount tests

## Licence
Sold under the Vibe96 Standard License. See LICENSE-NOTE.md.

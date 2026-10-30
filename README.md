# BillFlow - Invoice Studio

A fast, clean invoice tool for freelancers and small businesses. Create invoices, track Paid / Outstanding / Overdue, and print or save PDFs. Works offline. No account, no server, no tracking.

## Features
- Dashboard with Paid, Outstanding and Overdue totals
- Invoice editor with live paper preview, line items, tax, discount, notes
- 8 currencies, auto invoice numbers, duplicate and delete
- Print or save as PDF (print-optimised layout)
- Business profile (name, email, address, default tax, number prefix)
- JSON backup: export and import
- Offline-ready PWA, installable on phones
- Responsive, light and dark mode, keyboard accessible

## Tech
Vanilla HTML, CSS and JavaScript. Zero dependencies. No build step. No API keys or secrets. No network requests. Data is stored in the browser (localStorage). Strict Content-Security-Policy is set in index.html.

## Run locally
    python3 -m http.server 8080      (then open http://localhost:8080)
    npm run check                    (syntax check, optional)

## Deploy (static hosting)
Upload the folder to any static host: GitHub Pages, Cloudflare Pages, Netlify, Vercel, or any web server. No configuration needed. Service workers need HTTPS (or localhost).

## Customise
- Colours: CSS variables at the top of styles.css
- Currencies: the CUR array at the top of app.js
- Name and icon: index.html, manifest.webmanifest, icon.svg

## Files
index.html, styles.css, app.js, sw.js, manifest.webmanifest, icon.svg, docs/SETUP.md

## Privacy
All data stays in the buyer's browser. Nothing is sent anywhere. Clearing browser data erases invoices, so use Export backup regularly.

## License
Sold under the Vibe96 Standard License (one buyer, one end product).

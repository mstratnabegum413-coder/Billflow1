(() => {
'use strict';
const CUR = ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'AED', 'CAD', 'AUD'];
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36);
const { fresh, load, save: persist } = BillFlowStorage;
const app = $('#app');

let db = load();
function save() { if (!persist(db)) toast('Could not save. Browser storage is blocked or full.'); }
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2400); }
const money = (n, c) => { try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: c || db.profile.currency }).format(n); } catch (e) { return (c || '') + ' ' + Number(n).toFixed(2); } };
const calc = BillFlowCalc.calc;
const status = i => BillFlowCalc.status(i, today());
const nextNo = () => { const n = db.invoices.reduce((m, i) => Math.max(m, parseInt(String(i.no).replace(/\D/g, ''), 10) || 0), 0) + 1; return db.profile.prefix + String(n).padStart(4, '0'); };
const opts = cur => CUR.map(c => `<option${c === cur ? ' selected' : ''}>${c}</option>`).join('');

/* Dashboard */
function home() {
  const c = db.profile.currency;
  const mine = db.invoices.filter(i => (i.cur || c) === c);
  const sum = fn => mine.filter(i => fn(status(i))).reduce((s, i) => s + calc(i).total, 0);
  app.innerHTML = `<section class="stats">
    <div class="stat"><span>Paid</span><b>${money(sum(s => s === 'paid'), c)}</b></div>
    <div class="stat"><span>Outstanding</span><b>${money(sum(s => s === 'sent' || s === 'draft'), c)}</b></div>
    <div class="stat warn"><span>Overdue</span><b>${money(sum(s => s === 'overdue'), c)}</b></div></section>
    <div class="bar"><input id="q" type="search" placeholder="Search client or number" aria-label="Search invoices">
    <select id="st" aria-label="Filter by status" style="width:auto"><option value="">All</option><option>draft</option><option>sent</option><option>paid</option><option>overdue</option></select></div>
    <div id="list"></div>`;
  const paint = () => {
    const q = $('#q').value.toLowerCase(), f = $('#st').value;
    const L = db.invoices.filter(i => (!f || status(i) === f) && (i.client.name + i.no).toLowerCase().includes(q));
    $('#list').innerHTML = L.length ? L.map(i => `<a class="row" href="#edit-${esc(i.id)}"><div><strong>${esc(i.client.name || 'No client name')}</strong><small>${esc(i.no)}, due ${esc(i.due)}</small></div><div class="r"><b>${money(calc(i).total, i.cur)}</b><em class="tag ${status(i)}">${status(i)}</em></div></a>`).join('')
      : `<div class="card empty"><h2>${db.invoices.length ? 'No matches' : 'No invoices yet'}</h2><p class="mut">${db.invoices.length ? 'Try a different search or filter.' : 'Create your first invoice in under a minute.'}</p>${db.invoices.length ? '' : '<a class="btn primary" href="#new">Create invoice</a> <button id="demo" type="button">Load sample data</button>'}</div>`;
  };
  app.onclick = e => { if (e.target.id === 'demo') loadSample(); };
  $('#q').oninput = paint; $('#st').onchange = paint; paint();
}

/* Invoice editor with live paper preview */
function edit(id) {
  const found = db.invoices.find(i => i.id === id);
  if (id && !found) return home();
  const inv = found ? JSON.parse(JSON.stringify(found)) : { id: uid(), no: nextNo(), cur: db.profile.currency, client: { name: '', email: '', address: '' }, issued: today(), due: addDays(today(), 14), items: [{ d: '', q: 1, p: 0 }], tax: +db.profile.tax || 0, discount: 0, notes: '', status: 'draft' };
  app.innerHTML = `<form id="f" class="card"><h2>${found ? 'Edit invoice' : 'New invoice'}</h2>
    <div class="grid"><label>Invoice number<input name="no" required></label><label>Currency<select name="cur">${opts('')}</select></label>
    <label>Issue date<input type="date" name="issued" required></label><label>Due date<input type="date" name="due" required></label></div>
    <h3>Client</h3><label>Name<input name="c.name" required></label><label>Email<input type="email" name="c.email"></label><label>Address<textarea name="c.address" rows="2"></textarea></label>
    <h3>Items</h3><div id="items"></div><button type="button" id="add">Add item</button>
    <div class="grid" style="margin-top:14px"><label>Tax %<input type="number" name="tax" min="0" max="100" step="any"></label><label>Discount amount<input type="number" name="discount" min="0" step="any"></label>
    <label>Status<select name="status"><option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid</option></select></label></div>
    <label>Notes<textarea name="notes" rows="2" placeholder="Payment details or a thank-you note"></textarea></label>
    <div class="actions"><button class="primary" type="submit">Save invoice</button><button type="button" id="print">Print or save as PDF</button>
    ${found ? '<button type="button" id="dup">Duplicate</button><button type="button" id="del" class="danger">Delete</button>' : ''}</div></form><div id="sheet" class="sheet"></div>`;
  const f = $('#f');
  const get = n => n.startsWith('c.') ? inv.client[n.slice(2)] : inv[n];
  const set = (n, v) => { if (n.startsWith('c.')) inv.client[n.slice(2)] = v; else inv[n] = v; };
  $$('[name]', f).forEach(el => { el.value = get(el.name) ?? ''; });
  const rows = () => { $('#items').innerHTML = inv.items.map((x, k) => `<div class="item"><input data-k="${k}" data-f="d" value="${esc(x.d)}" placeholder="Description" aria-label="Description"><input data-k="${k}" data-f="q" type="number" min="0" step="any" value="${x.q}" aria-label="Quantity"><input data-k="${k}" data-f="p" type="number" min="0" step="any" value="${x.p}" aria-label="Unit price"><button type="button" class="x" data-rm="${k}" aria-label="Remove item">&times;</button></div>`).join(''); };
  const paint = () => {
    const t = calc(inv), p = db.profile;
    $('#sheet').innerHTML = `<header><div><h1>Invoice</h1><p>${esc(inv.no)}</p></div><div class="from"><strong>${esc(p.name || 'Your business')}</strong><p>${esc(p.email)}</p><p class="pre">${esc(p.address)}</p></div></header>
    <div class="meta"><div><small>Billed to</small><strong>${esc(inv.client.name || 'Client name')}</strong><p>${esc(inv.client.email)}</p><p class="pre">${esc(inv.client.address)}</p></div><div><small>Issued</small><p>${esc(inv.issued)}</p><small>Due</small><p>${esc(inv.due)}</p></div></div>
    <table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>${inv.items.map(x => `<tr><td>${esc(x.d) || '-'}</td><td>${x.q}</td><td>${money(x.p, inv.cur)}</td><td>${money(x.q * x.p, inv.cur)}</td></tr>`).join('')}</tbody></table>
    <dl class="tot"><dt>Subtotal</dt><dd>${money(t.sub, inv.cur)}</dd>${t.disc ? `<dt>Discount</dt><dd>-${money(t.disc, inv.cur)}</dd>` : ''}<dt>Tax (${inv.tax || 0}%)</dt><dd>${money(t.tax, inv.cur)}</dd><dt class="g">Amount due</dt><dd class="g">${money(t.total, inv.cur)}</dd></dl>
    ${inv.notes ? `<p class="pre note">${esc(inv.notes)}</p>` : ''}`;
  };
  f.addEventListener('input', e => {
    const el = e.target;
    if (el.dataset.f) { const x = inv.items[+el.dataset.k]; x[el.dataset.f] = el.dataset.f === 'd' ? el.value : (parseFloat(el.value) || 0); }
    else if (el.name) set(el.name, el.type === 'number' ? (parseFloat(el.value) || 0) : el.value);
    paint();
  });
  f.addEventListener('click', e => {
    const k = e.target.dataset.rm;
    if (k !== undefined) { if (inv.items.length > 1) inv.items.splice(+k, 1); rows(); paint(); }
  });
  $('#add').onclick = () => { inv.items.push({ d: '', q: 1, p: 0 }); rows(); paint(); };
  $('#print').onclick = () => window.print();
  f.onsubmit = e => {
    e.preventDefault();
    const n = db.invoices.findIndex(i => i.id === inv.id);
    if (n < 0) db.invoices.unshift(inv); else db.invoices[n] = inv;
    save(); toast('Invoice saved'); location.hash = '';
  };
  if (found) {
    $('#dup').onclick = () => { const c = JSON.parse(JSON.stringify(inv)); Object.assign(c, { id: uid(), no: nextNo(), status: 'draft', issued: today(), due: addDays(today(), 14) }); db.invoices.unshift(c); save(); toast('Duplicated'); location.hash = 'edit-' + c.id; };
    $('#del').onclick = () => { if (confirm('Delete this invoice? This cannot be undone.')) { db.invoices = db.invoices.filter(i => i.id !== inv.id); save(); toast('Invoice deleted'); location.hash = ''; } };
  }
  rows(); paint();
}

/* Business profile and backup */
function profile() {
  const p = db.profile;
  app.innerHTML = `<form id="f" class="card"><h2>Business profile</h2>
    <label>Business name<input name="name" value="${esc(p.name)}"></label><label>Email<input name="email" type="email" value="${esc(p.email)}"></label>
    <label>Address<textarea name="address" rows="2">${esc(p.address)}</textarea></label>
    <div class="grid"><label>Currency<select name="currency">${opts(p.currency)}</select></label><label>Default tax %<input name="tax" type="number" min="0" max="100" step="any" value="${+p.tax || 0}"></label><label>Number prefix<input name="prefix" maxlength="8" value="${esc(p.prefix)}"></label></div>
    <div class="actions"><button class="primary" type="submit">Save profile</button></div></form>
    <div class="card"><h2>Backup</h2><p class="mut">Your data stays in this browser only. Export a copy to keep it safe or move it to another device.</p>
    <div class="actions"><button id="exp">Export backup</button><label class="btn" style="margin:0">Import backup<input id="imp" type="file" accept="application/json" hidden></label><button id="rst" class="danger">Erase all data</button></div></div>`;
  $('#f').onsubmit = e => {
    e.preventDefault(); const d = new FormData(e.target);
    db.profile = { name: d.get('name'), email: d.get('email'), address: d.get('address'), currency: d.get('currency'), tax: parseFloat(d.get('tax')) || 0, prefix: d.get('prefix') };
    save(); toast('Profile saved');
  };
  $('#exp').onclick = () => BillFlowBackup.download(db, 'billflow-backup-' + today() + '.json');
  $('#imp').onchange = e => {
    const file = e.target.files[0]; if (!file) return;
    BillFlowBackup.read(file).then(v => { db = { profile: { ...fresh().profile, ...v.profile }, invoices: v.invoices }; save(); toast('Backup imported'); route(); }).catch(() => toast('That file is not a BillFlow backup'));
  };
  $('#rst').onclick = () => { if (confirm('Erase all invoices and settings from this browser?')) { db = fresh(); save(); toast('All data erased'); location.hash = ''; } };
}

function loadSample() {
  const d = today();
  const mk = (no, name, st, due, items) => ({ id: uid(), no, cur: 'USD', client: { name, email: '', address: '' }, issued: d, due, items, tax: 5, discount: 0, notes: 'Thank you for your business.', status: st });
  db.profile = { ...db.profile, name: 'Sample Studio', email: 'hello@example.com', address: '12 Example Street' };
  db.invoices = [
    mk('INV-0003', 'Sample Client C', 'draft', addDays(d, 14), [{ d: 'Logo design', q: 1, p: 350 }]),
    mk('INV-0002', 'Sample Client B', 'sent', addDays(d, 7), [{ d: 'Website pages', q: 4, p: 120 }, { d: 'Hosting setup', q: 1, p: 60 }]),
    mk('INV-0001', 'Sample Client A', 'paid', addDays(d, -20), [{ d: 'Monthly retainer', q: 1, p: 900 }])
  ];
  save(); toast('Sample data loaded'); route();
}

function route() {
  const h = location.hash.slice(1);
  if (h === 'new') edit(); else if (h.startsWith('edit-')) edit(h.slice(5)); else if (h === 'profile') profile(); else home();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
route();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('service-worker.js').catch(() => {});
})();

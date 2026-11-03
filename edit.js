/* Invoice editor with a live paper preview. */
(function (root) {
  'use strict';
  var ui = root.BillFlowUI;
  var calc = root.BillFlowCalc;
  var cfg = root.BillFlowConfig;
  var state = root.BillFlowState;
  var storage = root.BillFlowStorage;
  root.BillFlowViews = root.BillFlowViews || {};

  function blankInvoice(db) {
    return {
      id: storage.newId(), no: calc.nextInvoiceNumber(db.invoices, db.profile.prefix), cur: db.profile.currency,
      client: { name: '', email: '', address: '' }, issued: ui.today(), due: ui.addDays(ui.today(), cfg.DUE_DAYS),
      items: [{ d: '', q: 1, p: 0 }], tax: +db.profile.tax || 0, discount: 0, notes: '', status: 'draft'
    };
  }

  function formHtml(isSaved) {
    var statusOptions = cfg.EDITABLE_STATUSES.map(function (s) { return '<option value="' + s + '">' + s.charAt(0).toUpperCase() + s.slice(1) + '</option>'; }).join('');
    return `<form id="f" class="card">
        <h2>${isSaved ? 'Edit invoice' : 'New invoice'}</h2>
        <div class="grid">
          <label>Invoice number<input name="no" required></label>
          <label>Currency<select name="cur">${ui.currencyOptions('')}</select></label>
          <label>Issue date<input type="date" name="issued" required></label>
          <label>Due date<input type="date" name="due" required></label>
        </div>
        <h3>Client</h3>
        <label>Name<input name="c.name" required></label>
        <label>Email<input type="email" name="c.email"></label>
        <label>Address<textarea name="c.address" rows="2"></textarea></label>
        <h3>Items</h3>
        <div id="items"></div>
        <button type="button" id="add">Add item</button>
        <div class="grid mt">
          <label>Tax %<input type="number" name="tax" min="0" max="100" step="any"></label>
          <label>Discount amount<input type="number" name="discount" min="0" step="any"></label>
          <label>Status<select name="status">${statusOptions}</select></label>
        </div>
        <label>Notes<textarea name="notes" rows="2" placeholder="Payment details or a thank-you note"></textarea></label>
        <div class="actions">
          <button class="primary" type="submit">Save invoice</button>
          <button type="button" id="print">Print or save as PDF</button>
          ${isSaved ? '<button type="button" id="dup">Duplicate</button><button type="button" id="del" class="danger">Delete</button>' : ''}
        </div>
      </form>
      <div id="sheet" class="sheet"></div>`;
  }

  function itemRows(inv) {
    return inv.items.map(function (x, k) {
      return `<div class="item">
          <input data-k="${k}" data-f="d" value="${ui.esc(x.d)}" placeholder="Description" aria-label="Description">
          <input data-k="${k}" data-f="q" type="number" min="0" step="any" value="${x.q}" aria-label="Quantity">
          <input data-k="${k}" data-f="p" type="number" min="0" step="any" value="${x.p}" aria-label="Unit price">
          <button type="button" class="x" data-rm="${k}" aria-label="Remove item">&times;</button>
        </div>`;
    }).join('');
  }

  root.BillFlowViews.edit = function (id) {
    var db = state.db;
    var found = id ? db.invoices.find(function (i) { return i.id === id; }) : null;
    if (id && !found) { ui.toast(cfg.MESSAGES.notFound); location.hash = ''; return; }
    var inv = found ? JSON.parse(JSON.stringify(found)) : blankInvoice(db);
    ui.$('#app').innerHTML = formHtml(!!found);
    var form = ui.$('#f');
    function get(name) { return name.indexOf('c.') === 0 ? inv.client[name.slice(2)] : inv[name]; }
    function set(name, value) { if (name.indexOf('c.') === 0) inv.client[name.slice(2)] = value; else inv[name] = value; }
    function rows() { ui.$('#items').innerHTML = itemRows(inv); }
    function paint() { ui.$('#sheet').innerHTML = root.BillFlowSheet.html(inv, db.profile); }

    ui.$$('[name]', form).forEach(function (el) { var v = get(el.name); el.value = v == null ? '' : v; });
    form.addEventListener('input', function (e) {
      var el = e.target;
      if (el.dataset.f) {
        var item = inv.items[+el.dataset.k];
        item[el.dataset.f] = el.dataset.f === 'd' ? el.value : (parseFloat(el.value) || 0);
      } else if (el.name) {
        set(el.name, el.type === 'number' ? (parseFloat(el.value) || 0) : el.value);
      }
      paint();
    });
    form.addEventListener('click', function (e) {
      var k = e.target.dataset.rm;
      if (k !== undefined) { if (inv.items.length > 1) inv.items.splice(+k, 1); rows(); paint(); }
    });
    ui.$('#add').onclick = function () { inv.items.push({ d: '', q: 1, p: 0 }); rows(); paint(); };
    ui.$('#print').onclick = root.BillFlowSheet.print;
    form.onsubmit = function (e) {
      e.preventDefault();
      var n = db.invoices.findIndex(function (i) { return i.id === inv.id; });
      if (n < 0) db.invoices.unshift(inv); else db.invoices[n] = inv;
      state.save(); ui.toast(cfg.MESSAGES.invoiceSaved); location.hash = '';
    };
    if (found) {
      ui.$('#dup').onclick = function () {
        var copy = JSON.parse(JSON.stringify(inv));
        Object.assign(copy, { id: storage.newId(), no: calc.nextInvoiceNumber(db.invoices, db.profile.prefix), status: 'draft', issued: ui.today(), due: ui.addDays(ui.today(), cfg.DUE_DAYS) });
        db.invoices.unshift(copy); state.save(); ui.toast(cfg.MESSAGES.duplicated); location.hash = 'edit-' + copy.id;
      };
      ui.$('#del').onclick = function () {
        if (!inv.id || !confirm(cfg.MESSAGES.confirmDelete)) return;
        db.invoices = calc.removeInvoice(db.invoices, inv.id);
        state.save(); ui.toast(cfg.MESSAGES.invoiceDeleted); location.hash = '';
      };
    }
    rows(); paint();
  };
})(window);

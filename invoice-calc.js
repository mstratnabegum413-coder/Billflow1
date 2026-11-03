/* Invoice rules: totals, status, numbering and dashboard summaries. Pure functions, no DOM. */
(function (root) {
  'use strict';
  function round(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  /** Amount of one line item, rounded to cents. All amount arithmetic in the app goes through this file. */
  function lineTotal(item) { return round((+item.q || 0) * (+item.p || 0)); }
  function calc(inv) {
    var sub = round(inv.items.reduce(function (s, x) { return s + lineTotal(x); }, 0));
    var disc = round(Math.min(+inv.discount || 0, sub));
    var tax = round((sub - disc) * (+inv.tax || 0) / 100);
    return { sub: sub, disc: disc, tax: tax, total: round(sub - disc + tax) };
  }
  function status(inv, today) {
    return inv.status === 'paid' ? 'paid' : (inv.due < today ? 'overdue' : inv.status);
  }
  /** Next invoice number, for example nextInvoiceNumber([{no:'INV-0007'}], 'INV-') gives 'INV-0008'. */
  function nextInvoiceNumber(invoices, prefix) {
    var max = invoices.reduce(function (m, i) { return Math.max(m, parseInt(String(i.no).replace(/\D/g, ''), 10) || 0); }, 0);
    return (prefix || 'INV-') + String(max + 1).padStart(4, '0');
  }
  /** Paid, outstanding (draft and sent) and overdue totals for one currency. */
  function summarise(invoices, currency, today) {
    var out = { paid: 0, outstanding: 0, overdue: 0 };
    invoices.forEach(function (i) {
      if ((i.cur || currency) !== currency) return;
      var s = status(i, today);
      var total = calc(i).total;
      if (s === 'paid') out.paid += total; else if (s === 'overdue') out.overdue += total; else out.outstanding += total;
    });
    return { paid: round(out.paid), outstanding: round(out.outstanding), overdue: round(out.overdue) };
  }
  /** Removes exactly one invoice by id. A missing id removes nothing, never everything. */
  function removeInvoice(invoices, id) {
    if (!id) return invoices;
    return invoices.filter(function (i) { return i.id !== id; });
  }
  /** Line items: pure helpers so the editor view only has to render. */
  function addItem(inv) { inv.items.push({ d: '', q: 1, p: 0 }); return inv; }
  function removeItem(inv, k) { if (inv.items.length > 1 && k >= 0 && k < inv.items.length) inv.items.splice(k, 1); return inv; }
  function setItemField(inv, k, field, raw) {
    var item = inv.items[k];
    if (!item || ['d', 'q', 'p'].indexOf(field) < 0) return inv;
    item[field] = field === 'd' ? String(raw) : (parseFloat(raw) || 0);
    return inv;
  }
  var api = { addItem: addItem, removeItem: removeItem, setItemField: setItemField, round: round, lineTotal: lineTotal, removeInvoice: removeInvoice, calc: calc, status: status, nextInvoiceNumber: nextInvoiceNumber, summarise: summarise };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.BillFlowCalc = api;
})(typeof window !== 'undefined' ? window : globalThis);

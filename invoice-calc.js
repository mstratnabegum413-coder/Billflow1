/* Invoice rules: totals, status, numbering and dashboard summaries. Pure functions, no DOM. */
(function (root) {
  'use strict';
  function round(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function calc(inv) {
    var sub = round(inv.items.reduce(function (s, x) { return s + (+x.q || 0) * (+x.p || 0); }, 0));
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
  var api = { round: round, calc: calc, status: status, nextInvoiceNumber: nextInvoiceNumber, summarise: summarise };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.BillFlowCalc = api;
})(typeof window !== 'undefined' ? window : globalThis);

/* Invoice maths: subtotal, discount, tax and total. Pure functions, no DOM. */
(function (root) {
  'use strict';
  function round(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }
  function calc(inv) {
    const sub = round(inv.items.reduce((s, x) => s + (+x.q || 0) * (+x.p || 0), 0));
    const disc = round(Math.min(+inv.discount || 0, sub));
    const tax = round((sub - disc) * (+inv.tax || 0) / 100);
    return { sub: sub, disc: disc, tax: tax, total: round(sub - disc + tax) };
  }
  function status(inv, today) {
    return inv.status === 'paid' ? 'paid' : (inv.due < today ? 'overdue' : inv.status);
  }
  const api = { round: round, calc: calc, status: status };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BillFlowCalc = api;
})(typeof window !== 'undefined' ? window : globalThis);

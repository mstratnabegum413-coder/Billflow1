/* Demo fixtures, kept out of the runtime view code. */
(function (root) {
  'use strict';
  function create(today, addDays, newId) {
    function invoice(no, name, status, due, items) {
      return {
        id: newId(), no: no, cur: 'USD', client: { name: name, email: '', address: '' },
        issued: today, due: due, items: items, tax: 5, discount: 0, notes: 'Thank you for your business.', status: status
      };
    }
    return {
      profile: { name: 'Sample Studio', email: 'hello@example.com', address: '12 Example Street' },
      invoices: [
        invoice('INV-0003', 'Sample Client C', 'draft', addDays(today, 14), [{ d: 'Logo design', q: 1, p: 350 }]),
        invoice('INV-0002', 'Sample Client B', 'sent', addDays(today, 7), [{ d: 'Website pages', q: 4, p: 120 }, { d: 'Hosting setup', q: 1, p: 60 }]),
        invoice('INV-0001', 'Sample Client A', 'paid', addDays(today, -20), [{ d: 'Monthly retainer', q: 1, p: 900 }])
      ]
    };
  }
  var api = { create: create };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.BillFlowSample = api;
})(typeof window !== 'undefined' ? window : globalThis);

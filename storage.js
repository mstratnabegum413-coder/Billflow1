/* All localStorage reads and writes live here, isolated from UI code. */
(function (root) {
  'use strict';
  var KEY = 'billflow.v1';
  function fresh() {
    return { profile: { name: '', email: '', address: '', currency: 'USD', tax: 0, prefix: 'INV-' }, invoices: [] };
  }
  function load() {
    try {
      var v = JSON.parse(localStorage.getItem(KEY));
      if (v && Array.isArray(v.invoices)) return v;
    } catch (e) { /* first run or unreadable data */ }
    return fresh();
  }
  function save(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; } catch (e) { return false; }
  }
  root.BillFlowStorage = { KEY: KEY, fresh: fresh, load: load, save: save };
})(window);

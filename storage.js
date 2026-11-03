/* All localStorage reads and writes live here, isolated from UI code. Stored data carries a schema version. */
(function (root) {
  'use strict';
  var KEY = 'billflow.v1';
  var VERSION = 2;
  function fresh() {
    return { version: VERSION, profile: { name: '', email: '', address: '', currency: 'USD', tax: 0, prefix: 'INV-' }, invoices: [] };
  }
  /** Collision-resistant id: crypto.randomUUID when the browser has it, a random string otherwise. */
  function newId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  }
  /** Upgrades data saved by an older version of the app. Version 1 had no version field. */
  function migrate(raw) {
    var db = fresh();
    if (!raw || !Array.isArray(raw.invoices)) return db;
    db.profile = Object.assign(db.profile, raw.profile || {});
    db.invoices = raw.invoices.map(function (i) { return i.id ? i : Object.assign({}, i, { id: newId() }); });
    return db;
  }
  function load() {
    try { return migrate(JSON.parse(localStorage.getItem(KEY))); } catch (e) { return fresh(); }
  }
  function save(db) {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; } catch (e) { return false; }
  }
  var api = { KEY: KEY, VERSION: VERSION, fresh: fresh, newId: newId, migrate: migrate, load: load, save: save };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.BillFlowStorage = api;
})(typeof window !== 'undefined' ? window : globalThis);

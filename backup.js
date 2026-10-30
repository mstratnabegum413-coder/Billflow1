/* JSON backup: export a file, import with structure validation. */
(function (root) {
  'use strict';
  function validate(v) {
    if (!v || typeof v !== 'object' || !Array.isArray(v.invoices)) throw new Error('invalid backup');
    v.invoices.forEach(function (i) {
      if (!i || typeof i !== 'object' || !Array.isArray(i.items) || !i.client || typeof i.client !== 'object') throw new Error('invalid invoice');
      i.id = String(i.id || '').replace(/[^a-z0-9]/gi, '') || Math.random().toString(36).slice(2, 10);
      i.no = String(i.no || ''); i.cur = String(i.cur || 'USD');
      i.issued = String(i.issued || ''); i.due = String(i.due || '');
      i.tax = +i.tax || 0; i.discount = +i.discount || 0; i.notes = String(i.notes || '');
      i.status = ['draft', 'sent', 'paid'].indexOf(i.status) > -1 ? i.status : 'draft';
      i.client = { name: String(i.client.name || ''), email: String(i.client.email || ''), address: String(i.client.address || '') };
      i.items = i.items.map(function (x) { return { d: String((x && x.d) || ''), q: +(x && x.q) || 0, p: +(x && x.p) || 0 }; });
    });
    return v;
  }
  function read(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { try { resolve(validate(JSON.parse(r.result))); } catch (e) { reject(e); } };
      r.onerror = function () { reject(new Error('read failed')); };
      r.readAsText(file);
    });
  }
  function download(db, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' }));
    a.download = name; a.click(); URL.revokeObjectURL(a.href);
  }
  root.BillFlowBackup = { validate: validate, read: read, download: download };
})(window);

/* Business profile, JSON backup and reset. */
(function (root) {
  'use strict';
  var ui = root.BillFlowUI;
  var cfg = root.BillFlowConfig;
  var state = root.BillFlowState;
  var storage = root.BillFlowStorage;
  root.BillFlowViews = root.BillFlowViews || {};

  // Field descriptors: the profile form is rendered from these two lists.
  var FIELDS = [
    { name: 'name', label: 'Business name', type: 'text' },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'address', label: 'Address', type: 'textarea' }
  ];
  var GRID_FIELDS = [
    { name: 'currency', label: 'Currency', type: 'currency' },
    { name: 'tax', label: 'Default tax %', type: 'number', attrs: 'min="0" max="100" step="any"' },
    { name: 'prefix', label: 'Number prefix', type: 'text', attrs: 'maxlength="8"' }
  ];

  function fieldHtml(f, profile) {
    var value = profile[f.name];
    if (f.type === 'currency') return `<label>${f.label}<select name="${f.name}">${ui.currencyOptions(value)}</select></label>`;
    if (f.type === 'textarea') return `<label>${f.label}<textarea name="${f.name}" rows="2">${ui.esc(value)}</textarea></label>`;
    var shown = f.type === 'number' ? (+value || 0) : value;
    return `<label>${f.label}<input name="${f.name}" type="${f.type}" ${f.attrs || ''} value="${ui.esc(shown)}"></label>`;
  }

  root.BillFlowViews.profile = function () {
    var p = state.db.profile;
    ui.$('#app').innerHTML = `<form id="f" class="card">
        <h2>Business profile</h2>
        ${FIELDS.map(function (f) { return fieldHtml(f, p); }).join('')}
        <div class="grid">${GRID_FIELDS.map(function (f) { return fieldHtml(f, p); }).join('')}</div>
        <div class="actions"><button class="primary" type="submit">Save profile</button></div>
      </form>
      <div class="card">
        <h2>Backup</h2>
        <p class="mut">${cfg.MESSAGES.dataWarning}</p>
        <div class="actions">
          <button id="exp">Export backup</button>
          <label class="btn nm">Import backup<input id="imp" type="file" accept="application/json" hidden></label>
          <button id="rst" class="danger">Erase all data</button>
        </div>
      </div>`;
    ui.$('#f').onsubmit = function (e) {
      e.preventDefault();
      var d = new FormData(e.target);
      state.db.profile = { name: d.get('name'), email: d.get('email'), address: d.get('address'), currency: d.get('currency'), tax: parseFloat(d.get('tax')) || 0, prefix: d.get('prefix') };
      state.save(); ui.toast(cfg.MESSAGES.profileSaved);
    };
    ui.$('#exp').onclick = function () { root.BillFlowBackup.download(state.db, 'billflow-backup-' + ui.today() + '.json'); };
    ui.$('#imp').onchange = function (e) {
      var file = e.target.files[0];
      if (!file) return;
      root.BillFlowBackup.read(file).then(function (v) {
        state.db = storage.migrate(v);
        state.save(); ui.toast(cfg.MESSAGES.imported); root.BillFlowRouter.route();
      }).catch(function () { ui.toast(cfg.MESSAGES.badBackup); });
    };
    ui.$('#rst').onclick = function () {
      if (confirm(cfg.MESSAGES.confirmErase)) { state.db = storage.fresh(); state.save(); ui.toast(cfg.MESSAGES.erased); location.hash = ''; }
    };
  };
})(window);

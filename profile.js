/* Business profile, JSON backup and reset. */
(function (root) {
  'use strict';
  var ui = root.BillFlowUI;
  var cfg = root.BillFlowConfig;
  var state = root.BillFlowState;
  var storage = root.BillFlowStorage;
  root.BillFlowViews = root.BillFlowViews || {};

  root.BillFlowViews.profile = function () {
    var p = state.db.profile;
    ui.$('#app').innerHTML = `<form id="f" class="card">
        <h2>Business profile</h2>
        <label>Business name<input name="name" value="${ui.esc(p.name)}"></label>
        <label>Email<input name="email" type="email" value="${ui.esc(p.email)}"></label>
        <label>Address<textarea name="address" rows="2">${ui.esc(p.address)}</textarea></label>
        <div class="grid">
          <label>Currency<select name="currency">${ui.currencyOptions(p.currency)}</select></label>
          <label>Default tax %<input name="tax" type="number" min="0" max="100" step="any" value="${+p.tax || 0}"></label>
          <label>Number prefix<input name="prefix" maxlength="8" value="${ui.esc(p.prefix)}"></label>
        </div>
        <div class="actions"><button class="primary" type="submit">Save profile</button></div>
      </form>
      <div class="card">
        <h2>Backup</h2>
        <p class="mut">Your data stays in this browser only and is not protected by a password. Export a copy to keep it safe or move it to another device.</p>
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

/* Dashboard: totals, search, status filter and the invoice list. */
(function (root) {
  'use strict';
  var ui = root.BillFlowUI;
  var calc = root.BillFlowCalc;
  var cfg = root.BillFlowConfig;
  var state = root.BillFlowState;
  root.BillFlowViews = root.BillFlowViews || {};

  function loadSample() {
    var s = root.BillFlowSample.create(ui.today(), ui.addDays, root.BillFlowStorage.newId);
    state.db.profile = Object.assign({}, state.db.profile, s.profile);
    state.db.invoices = s.invoices;
    state.save();
    ui.toast(cfg.MESSAGES.sampleLoaded);
    root.BillFlowRouter.route();
  }

  function rowHtml(i, today) {
    var s = calc.status(i, today);
    return `<a class="row" href="#edit-${ui.esc(i.id)}">
        <div><strong>${ui.esc(i.client.name || 'No client name')}</strong><small>${ui.esc(i.no)}, due ${ui.esc(i.due)}</small></div>
        <div class="r"><b>${ui.money(calc.calc(i).total, i.cur)}</b><em class="tag ${s}">${s}</em></div>
      </a>`;
  }

  function emptyHtml(hasInvoices) {
    return `<div class="card empty">
        <h2>${hasInvoices ? 'No matches' : 'No invoices yet'}</h2>
        <p class="mut">${hasInvoices ? 'Try a different search or filter.' : 'Create your first invoice in under a minute.'}</p>
        ${hasInvoices ? '' : '<a class="btn primary" href="#new">Create invoice</a> <button id="demo" type="button">Load sample data</button>'}
      </div>`;
  }

  root.BillFlowViews.home = function () {
    var db = state.db;
    var currency = db.profile.currency;
    var today = ui.today();
    var totals = calc.summarise(db.invoices, currency, today);
    var filterOptions = cfg.FILTER_STATUSES.map(function (s) { return '<option>' + s + '</option>'; }).join('');
    ui.$('#app').innerHTML = `<section class="stats">
        <div class="stat"><span>Paid</span><b>${ui.money(totals.paid, currency)}</b></div>
        <div class="stat"><span>Outstanding</span><b>${ui.money(totals.outstanding, currency)}</b></div>
        <div class="stat warn"><span>Overdue</span><b>${ui.money(totals.overdue, currency)}</b></div>
      </section>
      <div class="bar">
        <input id="q" type="search" placeholder="Search client or number" aria-label="Search invoices">
        <select id="st" aria-label="Filter by status" class="auto"><option value="">All</option>${filterOptions}</select>
      </div>
      <div id="list"></div>`;
    function paint() {
      var q = ui.$('#q').value.toLowerCase();
      var f = ui.$('#st').value;
      var list = db.invoices.filter(function (i) {
        return (!f || calc.status(i, today) === f) && (i.client.name + i.no).toLowerCase().indexOf(q) > -1;
      });
      ui.$('#list').innerHTML = list.length ? list.map(function (i) { return rowHtml(i, today); }).join('') : emptyHtml(db.invoices.length > 0);
    }
    ui.$('#app').onclick = function (e) { if (e.target.id === 'demo') loadSample(); };
    ui.$('#q').oninput = paint;
    ui.$('#st').onchange = paint;
    paint();
  };
})(window);

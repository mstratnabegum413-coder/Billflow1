/* The printable invoice paper. Markup only; the browser print dialog does the PDF. */
(function (root) {
  'use strict';
  var ui = root.BillFlowUI;
  var calc = root.BillFlowCalc;

  function rowsHtml(inv) {
    return inv.items.map(function (x) {
      return `<tr>
        <td>${ui.esc(x.d) || '-'}</td>
        <td>${x.q}</td>
        <td>${ui.money(x.p, inv.cur)}</td>
        <td>${ui.money(calc.lineTotal(x), inv.cur)}</td>
      </tr>`;
    }).join('');
  }

  function html(inv, profile) {
    var t = calc.calc(inv);
    return `<header>
        <div><h1>Invoice</h1><p>${ui.esc(inv.no)}</p></div>
        <div class="from">
          <strong>${ui.esc(profile.name || 'Your business')}</strong>
          <p>${ui.esc(profile.email)}</p>
          <p class="pre">${ui.esc(profile.address)}</p>
        </div>
      </header>
      <div class="meta">
        <div>
          <small>Billed to</small>
          <strong>${ui.esc(inv.client.name || 'Client name')}</strong>
          <p>${ui.esc(inv.client.email)}</p>
          <p class="pre">${ui.esc(inv.client.address)}</p>
        </div>
        <div>
          <small>Issued</small><p>${ui.esc(inv.issued)}</p>
          <small>Due</small><p>${ui.esc(inv.due)}</p>
        </div>
      </div>
      <table>
        <thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead>
        <tbody>${rowsHtml(inv)}</tbody>
      </table>
      <dl class="tot">
        <dt>Subtotal</dt><dd>${ui.money(t.sub, inv.cur)}</dd>
        ${t.disc ? `<dt>Discount</dt><dd>-${ui.money(t.disc, inv.cur)}</dd>` : ''}
        <dt>Tax (${inv.tax || 0}%)</dt><dd>${ui.money(t.tax, inv.cur)}</dd>
        <dt class="g">Amount due</dt><dd class="g">${ui.money(t.total, inv.cur)}</dd>
      </dl>
      ${inv.notes ? `<p class="pre note">${ui.esc(inv.notes)}</p>` : ''}`;
  }

  root.BillFlowSheet = { html: html, print: function () { root.print(); } };
})(window);

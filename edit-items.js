/* Line-item rows of the invoice editor: markup and event delegation. Rules live in invoice-calc.js. */
(function (root) {
  'use strict';
  var ui = root.BillFlowUI;
  var calc = root.BillFlowCalc;

  function rowHtml(item, k) {
    return `<div class="item">
        <input data-k="${k}" data-f="d" value="${ui.esc(item.d)}" placeholder="Description" aria-label="Description">
        <input data-k="${k}" data-f="q" type="number" min="0" step="any" value="${item.q}" aria-label="Quantity">
        <input data-k="${k}" data-f="p" type="number" min="0" step="any" value="${item.p}" aria-label="Unit price">
        <button type="button" class="x" data-rm="${k}" aria-label="Remove item">&times;</button>
      </div>`;
  }

  /** Draws all rows and returns nothing. Call again after adding or removing an item. */
  function render(inv) { ui.$('#items').innerHTML = inv.items.map(rowHtml).join(''); }

  /** Handles typing in a row. Returns true when the event belonged to a line item. */
  function onInput(inv, el) {
    if (!el.dataset.f) return false;
    calc.setItemField(inv, +el.dataset.k, el.dataset.f, el.value);
    return true;
  }

  /** Handles the remove button. Returns true when a row was removed. */
  function onRemove(inv, target) {
    if (target.dataset.rm === undefined) return false;
    calc.removeItem(inv, +target.dataset.rm);
    render(inv);
    return true;
  }

  root.BillFlowEditItems = { render: render, onInput: onInput, onRemove: onRemove };
})(window);

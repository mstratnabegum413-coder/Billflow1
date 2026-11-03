/* Shared UI helpers: DOM shortcuts, escaping, dates, money formatting and the toast. */
(function (root) {
  'use strict';
  var cfg = root.BillFlowConfig;
  var ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  var timer;

  function $(selector, scope) { return (scope || document).querySelector(selector); }
  function $$(selector, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(selector)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESCAPES[c]; }); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function addDays(date, n) { var d = new Date(date); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  function money(n, currency) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency }).format(n); } catch (e) { return currency + ' ' + Number(n).toFixed(2); }
  }
  function currencyOptions(selected) {
    return cfg.CURRENCIES.map(function (c) { return '<option' + (c === selected ? ' selected' : '') + '>' + c + '</option>'; }).join('');
  }
  function toast(message) {
    var t = $('#toast');
    t.textContent = message;
    t.classList.add('on');
    clearTimeout(timer);
    timer = setTimeout(function () { t.classList.remove('on'); }, cfg.TOAST_MS);
  }
  root.BillFlowUI = { $: $, $$: $$, esc: esc, today: today, addDays: addDays, money: money, currencyOptions: currencyOptions, toast: toast };
})(window);

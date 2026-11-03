/* Bootstrap: start the router and register the offline service worker. */
(function () {
  'use strict';
  window.addEventListener('hashchange', window.BillFlowRouter.route);
  window.BillFlowRouter.route();
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('service-worker.js').catch(function () { /* offline mode is optional */ });
  }
})();

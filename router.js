/* Hash router: '', #new, #edit-ID and #profile. */
(function (root) {
  'use strict';
  function route() {
    var h = root.location.hash.slice(1);
    var views = root.BillFlowViews;
    if (h === 'new') views.edit();
    else if (h.indexOf('edit-') === 0) views.edit(h.slice(5));
    else if (h === 'profile') views.profile();
    else views.home();
    root.scrollTo(0, 0);
  }
  root.BillFlowRouter = { route: route };
})(window);

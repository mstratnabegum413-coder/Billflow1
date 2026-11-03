/* The one in-memory copy of the saved data, plus a save helper that reports failures. */
(function (root) {
  'use strict';
  var storage = root.BillFlowStorage;
  var state = {
    db: storage.load(),
    save: function () {
      if (!storage.save(state.db)) root.BillFlowUI.toast(root.BillFlowConfig.MESSAGES.storageFull);
    }
  };
  root.BillFlowState = state;
})(window);

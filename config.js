/* One place for supported currencies, statuses, timings and user-facing messages. */
(function (root) {
  'use strict';
  var CONFIG = {
    CURRENCIES: ['USD', 'EUR', 'GBP', 'BDT', 'INR', 'AED', 'CAD', 'AUD'],
    FILTER_STATUSES: ['draft', 'sent', 'paid', 'overdue'],
    EDITABLE_STATUSES: ['draft', 'sent', 'paid'],
    TOAST_MS: 2400,
    DUE_DAYS: 14,
    MESSAGES: {
      storageFull: 'Could not save. Browser storage is blocked or full.',
      notFound: 'Invoice not found',
      invoiceSaved: 'Invoice saved',
      invoiceDeleted: 'Invoice deleted',
      duplicated: 'Duplicated',
      profileSaved: 'Profile saved',
      sampleLoaded: 'Sample data loaded',
      imported: 'Backup imported',
      badBackup: 'That file is not a BillFlow backup',
      erased: 'All data erased',
      confirmDelete: 'Delete this invoice? This cannot be undone.',
      confirmErase: 'Erase all invoices and settings from this browser?'
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG; else root.BillFlowConfig = CONFIG;
})(typeof window !== 'undefined' ? window : globalThis);

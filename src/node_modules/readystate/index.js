'use strict';

//
// We are loaded in a Node.js environment. There are no resources to wait upon
// so we've got to manually advance it to the `complete` state. This ensures
// that all callbacks and check return the correct results and we can start as
// fast as possible with doing very important tasks.
//
module
  .exports = require('./readystate')
  .change('complete');

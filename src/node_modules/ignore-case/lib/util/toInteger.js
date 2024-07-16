'use strict';

module.exports = function toInteger(value) {
  if (!value) {
    return 0;
  }
  var val = +value;
  // Check if val is NaN
  if (val !== val) {
    return 0;
  }
  return val > 0 ? Math.floor(val) : Math.ceil(val);
};

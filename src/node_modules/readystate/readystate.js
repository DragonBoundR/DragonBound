'use strict';

/**
 * Generate a new prototype method which will the given function once the
 * desired state has been reached. The returned function accepts 2 arguments:
 *
 * - fn: The assigned function which needs to be called.
 * - context: Context/this value of the function we need to execute.
 *
 * @param {String} state The state we need to operate upon.
 * @returns {Function}
 * @api private
 */
function generate(state) {
  return function proxy(fn, context) {
    var rs = this;

    if (rs.is(state)) {
      setTimeout(function () {
        fn.call(context, rs.readyState);
      }, 0);
    } else {
      if (!rs._events[state]) rs._events[state] = [];
      rs._events[state].push({ fn: fn, context: context });
    }

    return rs;
  };
}

/**
 * RS (readyState) instance.
 *
 * @constructor
 * @api public
 */
function RS() {
  this.readyState = RS.UNKNOWN;
  this._events = {};
}

/**
 * The environment can be in different states. The following states are
 * generated:
 *
 * - ALL:         The I don't really give a fuck state.
 * - UNKNOWN:     We got an unknown readyState we should start listening for events.
 * - LOADING:     Environment is currently loading.
 * - INTERACTIVE: Environment is ready for modification.
 * - COMPLETE:    All resources have been loaded.
 *
 * Please note that the order of the `states` string/array is of vital
 * importance as it's used in the readyState check.
 *
 * @type {Number}
 * @private
 */
RS.states = 'ALL,UNKNOWN,LOADING,INTERACTIVE,COMPLETE'.split(',');

for (var s = 0, state; s < RS.states.length; s++) {
  state = RS.states[s];

  RS[state] = RS.prototype[state] = s;
  RS.prototype[state.toLowerCase()] = generate(state);
}

/**
 * A change in the environment has been detected so we need to change our
 * readyState and call assigned event listeners and those of the previous
 * states.
 *
 * @param {Number} state The new readyState that we detected.
 * @returns {RS}
 * @api private
 */
RS.prototype.change = function change(state) {
  state = this.clean(state, true);

  var j
    , name
    , i = 0
    , listener
    , rs = this
    , previously = rs.readyState;

  if (previously >= state) return rs;

  rs.readyState = state;

  for (; i < RS.states.length; i++) {
    if (i > state) break;
    name = RS.states[i];

    if (name in rs._events) {
      for (j = 0; j < rs._events[name].length; j++) {
        listener = rs._events[name][j];
        listener.fn.call(listener.context || rs, previously);
      }

      delete rs._events[name];
    }
  }

  return rs;
};

/**
 * Check if we're currently in a given readyState.
 *
 * @param {String|Number} state The required readyState.
 * @returns {Boolean} Indication if this state has been reached.
 * @api public
 */
RS.prototype.is = function is(state) {
  return this.readyState >= this.clean(state, true);
};

/**
 * Transform a state to a number or toUpperCase.
 *
 * @param {Mixed} state State to transform.
 * @param {Boolean} nr Change to number.
 * @returns {Mixed}
 * @api public
 */
RS.prototype.clean = function transform(state, nr) {
  var type = typeof state;

  if (nr) return 'number' !== type
  ? +RS[state.toUpperCase()] || 0
  : state;

  return ('number' === type ? RS.states[state] : state).toUpperCase();
};

/**
 * Removes all event listeners. Useful when you want to unload readystatechange
 * completely so that it won't react to any events anymore. See
 * https://github.com/unshiftio/readystate/issues/8
 *
 * @returns {Function} rs so that calls can be chained.
 * @api public
 */
RS.prototype.removeAllListeners = function removeAllListeners() {
  this._events = {};
  return this;
}

//
// Expose the module.
//
module.exports = new RS();

describe('readystate', function () {
  'use strict';

  var assume = require('assume')
    , readystate = require('./readystate')
    , RS = readystate.constructor;

  beforeEach(function () {
    readystate = new RS();
  });

  it('exposes a readyState property', function () {
    assume(readystate.readyState).equals(RS.UNKNOWN);
  });

  describe('#change', function () {
    it('allows strings to set the readyState', function () {
      readystate.change('complete');
      assume(readystate.readyState).equals(RS.COMPLETE);
    });

    it('allows strings to set the readyState', function () {
      readystate.change(RS.LOADING);
      assume(readystate.readyState).equals(RS.LOADING);
    });

    it('only allows changing if its a new readystate', function () {
      readystate.change(RS.LOADING);
      assume(readystate.readyState).equals(RS.LOADING);

      readystate.change(RS.UNKNOWN);
      assume(readystate.readyState).equals(RS.LOADING);
    });

    it('accepts random unknown states', function () {
      assume(readystate.readyState).equals(RS.UNKNOWN);

      readystate.change('foo bar banana');
      assume(readystate.readyState).equals(RS.UNKNOWN);
    });

    it('executes the assigned event listeners', function (next) {
      readystate.complete(function (previous) {
        assume(previous).equals(RS.UNKNOWN);

        next();
      });

      readystate.change('complete');
    });

    it('executes lower level event emitters', function (next) {
      readystate.loading(function () {
        next();
      });

      readystate.change('complete');
    });

    it('calls multiple event listeners', function (next) {
      var pattern = '';

      readystate.loading(function () { pattern = 'a'; });
      readystate.loading(function () {
        assume(pattern).equals('a');

        next();
      });

      readystate.change('loading');
    });
  });

  RS.states.filter(function (state) {
    return RS[state] > RS.UNKNOWN;
  }).forEach(function (state) {
    state = state.toLowerCase();

    describe('#'+ state, function () {
      it('calls the event listener when the event is triggered', function (next) {
        readystate[state](function changed() {
          next();
        });

        readystate.change(state);
      });

      it('call the function when the state is already set', function (next) {
        readystate.change(state);
        readystate[state](function changed() {
          next();
        });
      });

      it('call the function when the state is greater', function (next) {
        readystate.change('complete');
        readystate[state](function changed() {
          next();
        });
      });

      it('is an async call', function (next) {
        readystate.change('complete');

        var called = false;

        readystate[state](function changed() {
          called = true;
          next();
        });

        assume(called).is.false();
      });
    });
  });

  describe('#is', function () {
    it('is a function', function () {
      assume(readystate.is).is.a('function');
    });

    it('always returns `true` for the all mode', function () {
      assume(readystate.is(readystate.ALL)).is.true();
      assume(readystate.is('all')).is.true();
    });

    it('returns false for future ready states', function () {
      assume(readystate.is('complete')).is.false();

      readystate.change('complete');
      assume(readystate.is('complete')).is.true();
    });
  });

  describe('#clean', function () {
    it('is a function', function () {
      assume(readystate.clean).is.a('function');
    });

    it('changes strings to numbers', function () {
      assume(readystate.clean('unknown', true)).equals(1);
      assume(readystate.clean('UNKNOWN', true)).equals(1);
      assume(readystate.clean(1, true)).equals(1);
    });

    it('changes numbers to strings', function () {
      assume(readystate.clean('unknown')).equals('UNKNOWN');
      assume(readystate.clean('UNKNOWN')).equals('UNKNOWN');
      assume(readystate.clean(1)).equals('UNKNOWN');
    });
  });

  describe('#removeAllListeners', function () {
    it('is a function', function () {
      assume(readystate.removeAllListeners).is.a('function');
    });

    it('does not react to events anymore when all have been removed', function (next) {
      var interactiveReached = false;

      readystate.interactive(function () {
        interactiveReached = true
      });

      readystate
        .removeAllListeners()
        .change('interactive');

      setTimeout(function() {
        assume(interactiveReached).is.false();
        next();
      }, 20)
    });
  });
});

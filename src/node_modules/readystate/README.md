# readystate

[![Made by unshift](https://img.shields.io/badge/made%20by-unshift-00ffcc.svg?style=flat-square)](http://unshift.io)[![Version npm](http://img.shields.io/npm/v/readystate.svg?style=flat-square)](http://browsenpm.org/package/readystate)[![Build Status](http://img.shields.io/travis/unshiftio/readystate/master.svg?style=flat-square)](https://travis-ci.org/unshiftio/readystate)[![Dependencies](https://img.shields.io/david/unshiftio/readystate.svg?style=flat-square)](https://david-dm.org/unshiftio/readystate)[![Coverage Status](http://img.shields.io/coveralls/unshiftio/readystate/master.svg?style=flat-square)](https://coveralls.io/r/unshiftio/readystate?branch=master)[![IRC channel](http://img.shields.io/badge/IRC-irc.freenode.net%23unshift-00a8ff.svg?style=flat-square)](http://webchat.freenode.net/?channels=unshift)

`readystate` is a module to determine the `readystate` of the current document
and allows you to listen to various of `readystate` change events.

## Installation

The module is available for Node.js and Browsers (using browserify) and can be
installed by running the following command in your CLI:

```
npm install --save readystate
```

## Usage

In all examples we assume that you've required the library as following in your
code:

```js
'use strict';

var readystate = require('readystate');
```

The `readystate` is a pre-constructed `ReadyState` instance which exposes
various of methods to check and listen to `readystate` changes. Before
continuing with the API here is a list of the ready state's that we currently
support:

- `ALL`:         The I don't really give a fuck state.
- `UNKNOWN`:     We got an unknown readyState we should start listening for events.
- `LOADING`:     Environment is currently loading.
- `INTERACTIVE`: Environment is ready for interaction.
- `COMPLETE`:    All resources have been loaded.

The `INTERACTIVE` state can be used for DOM ready and the `COMPLETE` for load
events.

### readystate#is

The `is` method allows you check if a certain `readystate` has been reached. It
is not a strict check but a minimum check. For example if you want to know if
the `LOADING` state has been reached but your document is already in the
`COMPLETE` state we will return `true`.

```js
// assume that document is fully loaded, these will all return true.
readystate.is('loading');
readystate.is('LOADING');
readystate.is(readystate.LOADING);

// assume that document is in `loading` state, these will return false
readystate.is('interactive');
readystate.is('INTERACTIVE');
readystate.is(readystate.COMPLETE);
```

### readystate#{state}

We also you to assign callback for when a certain `readystate` is reached. If
the state has yet to be reached we will queue your callback until the state is
reached. If we are already in that state we will immediately call the supplied
callback.

```js
readystate.loading(function () { console.log('loading'); });
readystate.complete(function () { console.log('complete'); });
readystate.interactive(function () { console.log('interactive'); });
```

It also supports a second `context` argument which allows you to control the
`this` value of your callback:

```js
readystate.loading(function () {
  console.log(this); // 'foo'
}, 'foo');
```

### readystate.removeAllListeners

Remove all previously assigned listeners.

```js
readystate.removeAllListeners();
```

### readystate.readystate

**Please note, this is a private property**

We store our current detected `readystate` in the `.readystate` it might be
useful it you want to some manual checking.

## License

MIT

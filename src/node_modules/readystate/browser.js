'use strict';

var readystate = module.exports = require('./readystate')
  , win = (new Function('return this'))()
  , complete = 'complete'
  , root = true
  , doc = win.document
  , html = doc.documentElement;

(function wrapper() {
  //
  // Bail out early if the document is already fully loaded. This means that this
  // script is loaded after the onload event.
  //
  if (complete === doc.readyState) {
    return readystate.change(complete);
  }

  //
  // Use feature detection to see what kind of browser environment we're dealing
  // with. Old versions of Internet Explorer do not support the addEventListener
  // interface so we can also safely assume that we need to fall back to polling.
  //
  var modern = !!doc.addEventListener
    , prefix = modern ? '' : 'on'
    , on = modern ? 'addEventListener' : 'attachEvent'
    , off = modern ? 'removeEventListener' : 'detachEvent';

  if (!modern && 'function' === typeof html.doScroll) {
    try { root = !win.frameElement; }
    catch (e) {}

    if (root) (function polling() {
      try { html.doScroll('left'); }
      catch (e) { return setTimeout(polling, 50); }

      readystate.change('interactive');
    }());
  }

  /**
   * Handle the various of event listener calls.
   *
   * @param {Event} evt Simple DOM event.
   * @api private
   */
  function change(evt) {
    evt = evt || win.event;

    if ('readystatechange' === evt.type) {
      readystate.change(doc.readyState);
      if (complete !== doc.readyState) return;
    }

    if ('load' === evt.type) readystate.change('complete');
    else readystate.change('interactive');

    //
    // House keeping, remove our assigned event listeners.
    //
    (evt.type === 'load' ? win : doc)[off](evt.type, change, false);
  }

  //
  // Assign a shit load of event listeners so we can update our internal state.
  //
  doc[on](prefix +'DOMContentLoaded', change, false);
  doc[on](prefix +'readystatechange', change, false);
  win[on](prefix +'load', change, false);
} ());


'use strict';

var toInteger = require('./util/toInteger');
var clamp = require('./util/clamp');

function normalize(string) {
  return string ? (string + '').toUpperCase() : '';
}

function indexOf(string, searchString, position) {
  return normalize(string).indexOf(normalize(searchString), position);
}

exports.equals = function(string1, string2) {
  return normalize(string1) === normalize(string2);
};

exports.includes = function(string, searchString, position) {
  return indexOf(string, searchString, position) !== -1;
};

exports.startsWith = function(string, searchString, position) {
  var str = normalize(string);
  var searchStr = normalize(searchString);
  var start = clamp(toInteger(position), 0, str.length);
  return start + searchStr.length <= str.length && str.lastIndexOf(searchStr, start) === start;
};

exports.endsWith = function(string, searchString, position) {
  var str = normalize(string);
  var searchStr = normalize(searchString);
  var pos = position === undefined ? str.length : toInteger(position);
  var end = clamp(pos, 0, str.length);
  var start = end - searchStr.length;
  return start >= 0 && str.indexOf(searchStr, start) === start;
};

exports.indexOf = indexOf;

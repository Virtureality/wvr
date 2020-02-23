'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var t = function () {
  throw new Error('Thrown by source-map-fixtures');
};

var i = function () {
  return 42;
};

var q = function (a) {
  if (a === 42) {
    return true;
  }
};

exports.branching = q;
exports.simple = i;
exports.throws = t;

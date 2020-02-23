"use strict";

var keys = module.exports.keys = function keys(o) {
    var k;
    var r = [];
   // iterate over object keys
    for (k in o) {
        if (o.hasOwnProperty(k)) {
            r.push(k);
        }
    }
    return r;
};

var forEach = module.exports.forEach = function forEach(array, callback, thisArg) {
    for (var i = 0; i < array.length; i++) {
        callback.call(thisArg, array[i]);
    }
};

module.exports.objectCreate = function objectCreate(o, args) {
    if (typeof Object.create === "function") {
        return Object.create(o, args);
    } else {
        var F = function () {};
        F.prototype = o;
        if (o && typeof o === "object") {
            forEach(keys(args), function (name) {
                defineProperty(F.prototype, name, args[name]);
            });
        }
        return new F();
    }
};

var defineProperty = module.exports.defineProperty = function defineProperty(object, key, options) {
    if (typeof Object.defineProperty === "function") {
        Object.defineProperty(object, key, options);
    } else {
        object[key] = options.value;
    }
};

var nodeunit = require('nodeunit');
var tape = require('tape');

/**
 * a nodeunit TAPE based reporter-type thing
 *
 * @param  {object}   modules  mapping of { name : loaded-module }
 * @param  {Function} callback called when finished
 */
exports.run = function(modules, callback) {

    callback = callback || function(){};

    var options = {};

    var nameStack = [];
    var testStack = [];

    options.moduleStart = function(name) {
        nameStack.push(name);
    }

    options.moduleDone = function(name, assertions) {
        nameStack.pop();
    }

    options.testStart = function(name) {
        nameStack.push(name);
        tape(nameStack.join(" - "), function(test) {
            testStack.unshift(test);
        })
    }

    options.log = function(assertion) {
        var test = testStack[0];
        if (assertion.passed()) {
            test.pass(assertion.message);
        } else if (assertion.error) {
            test.error(assertion.error);
        } else {
            test.fail(assertion.message)
        }
    }

    options.testDone = function(name, assertions) {
        nameStack.pop();
        var test = testStack.shift();
        test.end();
    }

    options.done = function(assertions) {
        return callback(null, assertions);
    };

    nodeunit.runModules(modules, options);
}
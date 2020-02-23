var EventEmitter = require('events').EventEmitter;


function noop(callback) {
  process.nextTick(callback);
}

function makeAsync(func) {
  if (func.length === 1) {
    return func;
  } else if (func.length === 0) {
    return function(done) {
      process.nextTick(function() {
        try {
          func();
        } catch (err) {
          done(err);
        }
        done();
      });
    }
  }
}



/**
 * Create a new benchmark.
 * @constructor
 * @param {Object} config Benchmark config.
 *
 * Config properties:
 *  * test - {function()} Required test function to be timed.
 *  * before - {function()} Optional function to be called once before the test
 *      series is run.  If the function accepts a callback, it is assumed to be
 *      asynchronous.  The callback should be called with any error.
 *  * beforeEach - {function()} Optional function to be called before each test
 *      run.  If the function accepts a callback, it is assumed to be
 *      asynchronous.  The callback should be called with any error.
 *  * afterEach - {function()} Optional function to be called after each test
 *      run.  If the function accepts a callback, it is assumed to be
 *      asynchronous.  The callback should be called with any error.
 *  * after - {function()} Optional function to be called once after the test
 *      series is run.  If the function accepts a callback, it is assumed to be
 *      asynchronous.  The callback should be called with any error.
 *  * duration - {number} The test function will be run repeatedly until this
 *      duration is reached (in seconds).  Default is 1 second.
 */
var Benchmark = exports.Benchmark = function(config) {
  if (!config) {
    throw new Error('Missing required config');
  }
  if (!config.test) {
    throw new Error('Missing required config.test');
  }

  /**
   * Function to benchmark.  Should accept a callback if asynchronous.
   * @type {function()}
   */
  this._test = config.test;

  /**
   * Function called before benchmarking begins.  Should accept a callback if
   * asynchronous.
   * @type {function()}
   */
  this._before = makeAsync(config.before || noop);


  /**
   * Function called before every benchmark run.  Should accept a callback if
   * asynchronous.
   * @type {function()}
   */
  this._beforeEach = makeAsync(config.beforeEach || noop);


  /**
   * Function called after every benchmark run.  Should accept a callback if
   * asynchronous.
   * @type {function()}
   */
  this._afterEach = makeAsync(config.afterEach || noop);

  /**
   * Function called after the benchmark is done.  Should accept a callback if
   * asynchronous.
   * @type {function()}
   */
  this._after = makeAsync(config.after || noop);

  /**
   * Time to spend running the test function (in seconds).  Default is 1 second.
   * @type {number}
   */
  this._duration = config.duration || 1;

};


/**
 * Run the test function.
 * @return {events.EventEmitter} An event emitter.  Emits a 'data' event with
 *     the number of nanoseconds for the most recent test run.  Emits a 'done'
 *     event with the total number of calls and elapsed time (in nanoseconds
 *     for all test runs).  Emits an 'error' event with an error if one of the
 *     test calls fails.
 */
Benchmark.prototype.run = function() {
  var emitter = new EventEmitter();
  this._before(this._beforeCallback.bind(this, emitter));
  return emitter;
};


/**
 * Callback for before function.
 * @param {events.EventEmitter} emitter Event emitter.
 * @param {Error} err Any error.
 */
Benchmark.prototype._beforeCallback = function(emitter, err) {
  if (err) {
    emitter.emit('error', err);
    return;
  }
  this._runForDuration(emitter, 0, 0);
};


/**
 * Run the test function until the elapsed time exceeds the configured duration.
 * @param {events.EventEmitter} emitter Event emitter.
 * @param {number} calls Number of calls.
 * @param {number} elapsed Elapsed time (nanoseconds).
 */
Benchmark.prototype._runForDuration = function(emitter, calls, elapsed) {
  if (elapsed < this._duration * 1e9) {
    this._beforeEach(
        this._beforeEachCallback.bind(this, emitter, calls, elapsed));
  } else {
    this._after(this._afterCallback.bind(this, emitter, calls, elapsed));
  }
};


/**
 * Callback for beforeEach function.
 * @param {events.EventEmitter} emitter Event emitter.
 * @param {number} calls Cumulative number of test runs.
 * @param {number} elapsed Total elapsed time (in nanoseconds).
 * @param {Error} err Any error.
 */
Benchmark.prototype._beforeEachCallback = function(emitter, calls, elapsed,
    err) {
  if (err) {
    emitter.emit('error', err);
    return;
  }
  this._runOnce(this._runOnceCallback.bind(this, emitter, calls, elapsed));
};


/**
 * Time one run of the test function.
 * @param {function(Error, number)} callback Callback called with any error and
 *     the number of nanoseconds elapsed.
 */
Benchmark.prototype._runOnce = function(callback) {
  var synchronous = this._test.length === 0;
  var time;
  try {
    time = process.hrtime();
    this._test(function(err) {
      var diff = process.hrtime(time);
      var nanoseconds = diff[0] * 1e9 + diff[1];
      callback(err, nanoseconds);
    });
  } catch (err) {
    callback(err);
    return;
  }
  var diff = process.hrtime(time);
  if (synchronous) {
    var nanoseconds = diff[0] * 1e9 + diff[1];
    callback(null, nanoseconds);
  }
};


/**
 * Callback for test runs.
 * @param {events.EventEmitter} emitter Event emitter.
 * @param {number} calls Cumulative number of test runs.
 * @param {number} elapsed Total elapsed time (in nanoseconds).
 * @param {Error} err Any error.
 * @param {number} nanoseconds Duration of last run.
 */
Benchmark.prototype._runOnceCallback = function(emitter, calls, elapsed, err,
    nanoseconds) {
  if (err) {
    emitter.emit('error', err);
    return;
  }
  emitter.emit('data', nanoseconds);
  elapsed += nanoseconds;
  ++calls;
  this._afterEach(this._afterEachCallback.bind(this, emitter, calls, elapsed));
};


/**
 * Callback for afterEach function.
 * @param {events.EventEmitter} emitter Event emitter.
 * @param {number} calls Cumulative number of test runs.
 * @param {number} elapsed Total elapsed time (in nanoseconds).
 * @param {Error} err Any error.
 */
Benchmark.prototype._afterEachCallback = function(emitter, calls, elapsed,
    err) {
  if (err) {
    emitter.emit('error', err);
    return;
  }
  setImmediate(this._runForDuration.bind(this, emitter, calls, elapsed));
};


/**
 * Callback for after function.
 * @param {events.EventEmitter} emitter Event emitter.
 * @param {number} calls Number of calls.
 * @param {number} elapsed Elapsed time (in nanoseconds).
 * @param {Error} err Any error.
 */
Benchmark.prototype._afterCallback = function(emitter, calls, elapsed, err) {
  if (err) {
    emitter.emit('error', err);
    return;
  }
  emitter.emit('done', calls, elapsed);
};

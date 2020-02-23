var path = require('path');

var Benchmark = require('./benchmark').Benchmark;


function iterate(files, current, callback) {
  var file = files[current];
  if (!file) {
    return callback(null);
  }
  var benchmark;
  try {
    var config = require(path.resolve(file));
    benchmark = new Benchmark(config);
  } catch (err) {
    return callback(
        new Error('Benchmark failed: ' + file + '\n' + err.message));
  }
  var emitter = benchmark.run();
  emitter.on('error', function(err) {
    callback(new Error('Benchmark failed: ' + file + '\n' + err.message));
  });
  // TODO: introduce reporter
  emitter.on('done', function(calls, elapsed) {
    console.log('%s %d ops/sec',
        path.basename(file), Math.floor(calls / (elapsed / 1e9)));
    ++current;
    iterate(files, current, callback);
  });
}


/**
 * Run a series of benchmarks.
 * @param {Array.<string>} files Array of paths to benchmark modules.
 */
var exports = module.exports = function(files) {
  iterate(files, 0, function(err) {
    if (err) {
      console.error(err.message);
      process.exit(1);
    }
    process.exit(0);
  });
};

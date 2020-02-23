var nodeunit = require('./nodeunit-tape.js');

var tests = {
    'nodeunit-tape': require('./tests.js')
};

nodeunit.run(tests);
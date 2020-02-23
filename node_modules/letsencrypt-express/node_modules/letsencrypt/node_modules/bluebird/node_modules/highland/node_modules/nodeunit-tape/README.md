nodeunit-tape
=============

Just enough tape to run nodeunit tests in the browser

Install
-------

nodeunit-tape declares peer dependencies on tape and nodeunit.

```bash
npm install --save-dev nodeunit-tape
```

Create a file that will load and run your tests. If you want this to work with browserify, make sure all of your require statements use exact literal strings.

```javascript
// run-tests.js
var nodeunit = require('nodeunit-tape');

var tests = {
    'module1': require('./tests/module1.js'),
    'module2': require('./tests/module2.js')
};

nodeunit.run(tests);
```

Running
-------

In node

```bash
node run-tests.js
```

In testling locally

```bash
browserify -i 'node_modules/nodeunit/lib/reporters/index.js' run-tests.js | testling
```

See the testling docs for how to run these in "the cloud" against actual browsers.
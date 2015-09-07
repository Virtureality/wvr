'use strict';

var mean = require('meanio');

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Wvr, app, auth, database) {

	app.route('/api/wvr/*')
		.get(function(req, res, next) {
			res.json({message: 'Welcome to our REST API! :)'});
		});

};

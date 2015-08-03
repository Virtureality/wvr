'use strict';

var mean = require('meanio');

var mongoose = require('mongoose'),
	UserModel = mongoose.model('User');

// jshint -W098 
// The Package is past automatically as first parameter
module.exports = function(Wvr, app, auth, database) {

	 var express = require('express');
	 var router = express.Router();

	router.route('/users')
		.post(function(req, res, next) {
			var keywords = req.body.keywords;
			UserModel
				.find(function(err, users) {
					if(err) {
						res.send(err);
					} else {
						res.json(users);
					}
				})
				.or([{ name: keywords }, { email: keywords }]);
		});

	app.use('/api/wvr/user', router);

};

'use strict';

var httpForward = require('http-forward'),
	cryptoJS = require('node-cryptojs-aes').CryptoJS;

 /*var mongoose = require('mongoose'),
	UserModel = mongoose.model('User');*/

// jshint -W098 
// The Package is past automatically as first parameter
module.exports = function(Wvr, app, auth, database, passport) {

	 var express = require('express');
	 var router = express.Router();

	router.all('/*', function(req, res, next) {
		var cid = req.headers.fabala || '';
		var targetURL = req.protocol + '://' + req.headers.host + '/api';
		var decrypted = cryptoJS.AES.decrypt(cid, 'FBLWVRCipherKey333');
		var clearToken = cryptoJS.enc.Utf8.stringify(decrypted);
		req.headers.authorization = 'Bearer ' + clearToken;
		req.forward = { target: targetURL};
		httpForward(req, res);
	});

	app.use(require('connect-restreamer')());
	app.use('/api/proxy', router);

};

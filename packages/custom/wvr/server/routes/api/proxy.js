'use strict';

var fs = require('fs'),
	path = require('path'),
	rootPath = path.normalize(__dirname + '/../../../../../..');

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
		if(req.protocol === 'https') {
			req.proxy = req.proxy || {};
			req.proxy.ssl = {
				key: fs.readFileSync(rootPath + '/config/sslcert/wvr.key', 'utf8'),
				cert: fs.readFileSync(rootPath + '/config/sslcert/wvr.crt', 'utf8')
			};
			req.proxy.secure = false;
		}
		httpForward(req, res);
	});

	app.use(require('connect-restreamer')());
	app.use('/api/proxy', router);

};

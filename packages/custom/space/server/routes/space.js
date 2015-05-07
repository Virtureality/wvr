'use strict';

var mean = require('meanio');

// jshint -W098 
// The Package is past automatically as first parameter
module.exports = function(Space, app, auth, database) {

	 var express = require('express');
	 var router = express.Router();

	 // middleware specific to this router
	 router.use(function timeLog(req, res, next) {
	 	console.log('Time: ', Date.now());
	 	next();
	 });

	 //Space Home route
	 router.get('/*', function(req, res, next) {
	         Space.render('home', {
	           package: 'space'
	         }, function(err, html) {
	           //Rendering a view from the Package server/views
	           res.send(html);
	         });
	       });
	 
	 app.use('/space', router);

};

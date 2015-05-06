'use strict';

var mean = require('meanio');

// jshint -W098 
// The Package is past automatically as first parameter
module.exports = function(Wvr, app, auth, database) {

	 var express = require('express');
	 var router = express.Router();

	 // middleware specific to this router
	 router.use(function timeLog(req, res, next) {
	 	console.log('Time: ', Date.now());
	 	next();
	 });

	 //Space Home route
	 router.get('/', function(req, res, next) {
	         Wvr.render('space/home', {
	           package: 'space'
	         }, function(err, html) {
	           //Rendering a view from the Package server/views
	           res.send(html);
	         });
	       });

	 //Space route
	 //router.get('/:spaceId', auth.requiresLogin, function(req, res, next) {
	 router.get('/:spaceId', function(req, res, next) {
		 /*
		 if(!req.user) {
			 res.redirect('/#!/auth/login');
		 } else{
	         Wvr.render('space/space', {
	           spaceId: req.params.spaceId,
	           user: req.user ? {
				      name: req.user.name,
				      _id: req.user._id,
				      username: req.user.username,
				      profile: req.user.profile,
				      roles: req.user.roles
				    } : {}
	         }, function(err, html) {
	           //Rendering a view from the Package server/views
	           res.send(html);
	         });
		 }
	     */
		 Wvr.render('space/space', {
	           spaceId: req.params.spaceId,
	           user: req.user ? {
				      name: req.user.name,
				      _id: req.user._id,
				      username: req.user.username,
				      profile: req.user.profile,
				      roles: req.user.roles
				    } : {}
	         }, function(err, html) {
	           //Rendering a view from the Package server/views
	           res.send(html);
	         });
		 
			  /*var modules = [];
			  // Preparing angular modules list with dependencies
			  for (var name in mean.modules) {
			    modules.push({
			      name: name,
			      module: 'mean.' + name,
			      angularDependencies: mean.modules[name].angularDependencies
			    });
			  }
	
			  // Send some basic starting info to the view
			  res.render('space/space', {
			    user: req.user ? {
			      name: req.user.name,
			      _id: req.user._id,
			      username: req.user.username,
			      profile: req.user.profile,
			      roles: req.user.roles
			    } : {},
			    //modules: modules
			    spaceId: req.params.spaceId
			  });*/
		 
	       });
	 
	 app.use('/wvr/space', router);

};

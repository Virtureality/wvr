'use strict';

var mean = require('meanio');

var mongoose = require('mongoose'),
	SpaceModel = mongoose.model('Space');

// jshint -W098 
// The Package is past automatically as first parameter
module.exports = function(Space, app, auth, database) {

	 var express = require('express');
	 var router = express.Router();

	 // middleware specific to this router
	 /*router.use(function timeLog(req, res, next) {
	 	console.log('Time: ', Date.now());
	 	next();
	 });*/

	router.route('/spaces')
		.get(function(req, res, next) {
			SpaceModel.find(function(err, spaces) {
				if(err) {
					res.send(err);
				} else {
					res.json(spaces);
				}
			});
		})
		.post(function(req, res, next) {
			var space = new SpaceModel();

			//space.uniqueName = space._id;
			space.name = req.body.name;
			space.type = 'Studio';

			space.save(function(err) {
				if(err) {
					res.send(err);
				} else {
					res.json({message: 'Space Created!'});
				}
			});

		});

	router.route('/spaces/:spaceId')
		.get(function(req, res, next) {
			SpaceModel.findById(req.params.spaceId, function(err, space) {
				if(err) {
					res.send(err);
				} else {
					res.json(space);
				}
			});
		})
		.put(function(req, res, next) {
			SpaceModel.findById(req.params.spaceId, function(err, space) {
				if(err) {
					res.send(err);
				} else {
					space.name = req.body.name;

					space.save(function(err) {
						if(err) {
							res.send(err);
						} else {
							res.json({message: 'Space Updated!'});
						}
					});
				}
			});
		})
		.delete(function(req, res, next) {
			SpaceModel.remove({
				_id: req.params.spaceId
			}, function(err, space) {
				if(err) {
					res.send(err);
				} else {
					res.json({message: 'Successfully Deleted!'});
				}
			});
		});

	router.get('/*', function(req, res, next) {
		res.json({message: 'Welcome to our REST API! :)'});
	});
	 
	app.use('/space', router);

};

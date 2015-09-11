'use strict';

var mean = require('meanio');

var mongoose = require('mongoose'),
	SpaceModel = mongoose.model('Space');

function assembleSpace(space, req) {
	if(req.body) {
		var spaceObj = req.body;

		if(spaceObj.uuid && spaceObj.uuid != '') {
			space.uuid = spaceObj.uuid;
		}

		if(spaceObj.name && spaceObj.name != '') {
			space.name = spaceObj.name;
		}

		if(spaceObj.owner && spaceObj.owner != '') {
			space.owner = spaceObj.owner;
		}

		if(spaceObj.type && spaceObj.type != '') {
			space.type = spaceObj.type;
		}

		if(spaceObj.facilities && Array.isArray(spaceObj.facilities)) {
			space.facilities = spaceObj.facilities;
		}

		if(spaceObj.spaces && Array.isArray(spaceObj.spaces)) {
			space.spaces = spaceObj.spaces;
		}

	}

	return space;
};

// jshint -W098 
// The Package is past automatically as first parameter
module.exports = function(Wvr, app, auth, database) {

	var express = require('express');
	var router = express.Router();

	var paginate = require('node-paginate-anything');

	 // middleware specific to this router
	 /*router.use(function timeLog(req, res, next) {
	 	console.log('Time: ', Date.now());
	 	next();
	 });*/

	router.route('/spaces')
		.get(function(req, res, next) {
			var q = req.query.q;
			var query;

			if(q && q != '') {
				query = SpaceModel.find({ $text : { $search : q } });
			} else {
				query = SpaceModel.find();
			}

			query.populate('owner', 'email name');

			query.exec(function(err, spaces) {
					if(err) {
						res.send(err);
					} else {
						var queryParameters = paginate(req, res, spaces.length, 1000);

						query.limit(queryParameters.limit);
						query.skip(queryParameters.skip);

						query.exec(function(err, spaces) {
							if(err) {
								res.send(err);
							} else {
								res.json(spaces);
							}});
					}
				});
		})
		.post(function(req, res, next) {
			var space = new SpaceModel();

			space = assembleSpace(space, req);

			space.save(function(err) {
				if(err) {
					res.send(err);
				} else {
					res.json({"message": 'Space Created!', "space": space});
				}
			});

		});

	/**/
	router.route('/spaces/:spaceId')
		.get(function(req, res, next) {
			SpaceModel
				.findOne({ uuid: req.params.spaceId }, function(err, space) {
					if(err) {
						res.send(err);
					} else {
						res.json(space);
					}
				})
				.populate('owner', '_id email name')
				.populate('facilities.owner', '_id email name');
		})
		.put(function(req, res, next) {
			SpaceModel.findOneAndUpdate({ uuid: req.params.spaceId }, req.body, function(err, result) {
				if(err) {
					res.send(err);
				} else {
					res.json({"message": 'Space Updated!', "space": result});
				}
			})
			.populate('owner', '_id email name')
			.populate('facilities.owner', '_id email name');
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

	app.use('/api/wvr/space', router);

};

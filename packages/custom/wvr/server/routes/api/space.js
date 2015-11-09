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
			var initialQuery, finalQuery;

			if(q && q != '') {
				initialQuery = SpaceModel.find({ $text : { $search : q } });
			} else {
				initialQuery = SpaceModel.find();
			}

			initialQuery.exec(function(err, spaces) {
				if(err) {
					res.send(err);
				} else {
					if(spaces.length > 0) {
						if(q && q != '') {
							finalQuery = SpaceModel.find({ $text : { $search : q } });
						} else {
							finalQuery = SpaceModel.find();
						}

						doFinalQuery(finalQuery);
					} else {
						var newSpace = new SpaceModel();

						newSpace.uuid = q;
						newSpace.name = q;

						newSpace.save(function(err) {
							if(err) {
								res.send(err);
							} else {
								finalQuery = SpaceModel.find(newSpace);
								doFinalQuery(finalQuery);
							}
						});
					}
				}
			});

			function doFinalQuery(finalQuery) {
				if(finalQuery) {
					finalQuery.populate('owner', 'email name');

					finalQuery.exec(function(err, finalSpaces) {
						if(err) {
							res.send(err);
						} else {
							if(finalSpaces.length > 0) {
								var queryParameters = paginate(req, res, finalSpaces.length, 1000);

								finalQuery.limit(queryParameters.limit);
								finalQuery.skip(queryParameters.skip);

								finalQuery.exec(function(err, spaces) {
									if(err) {
										res.send(err);
									} else {
										res.json(spaces);
									}
								});
							}
						}
					});
				}
			}
		})
		.post(function(req, res, next) {
			var space = new SpaceModel();

			space = assembleSpace(space, req);

			space.save(function(err) {
				if(err) {
					res.send(err);
				} else {
					SpaceModel
						.findById(space, function(err, space) {
							if(err) {
								res.send(err);
							} else {
								res.json({"message": 'Space Created!', "space": space});
							}
						})
						.populate('owner', '_id email name');
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
			var query;

			query = SpaceModel.findOneAndUpdate({ uuid: req.params.spaceId }, req.body);

			query.exec(function(err, result) {
				if(err) {
					res.send(err);
				} else {
					SpaceModel
						.findById(result, function(err, space) {
							if(err) {
								res.send(err);
							} else {
								res.json({"message": 'Space Updated!', "space": space});
							}
						})
						.populate('owner', '_id email name')
						.populate('facilities.owner', '_id email name');
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

	router.route('/key')
		.post(function(req, res, next) {
			/*console.log('space: ' + req.body.spaceId);
			console.log('key: ' + req.body.key);*/
			SpaceModel
				.findOne({ uuid: req.body.spaceId }, function(err, space) {

					var spaceResultAsString = JSON.stringify(space);
					//console.log('Space for verifying the key: ' + spaceResultAsString);
					var spaceResultAsJSON = JSON.parse(spaceResultAsString);
					//console.log('spaceResultAsJSON.locker: ' + spaceResultAsJSON.locker);
					//console.log('space.locker: ' + space.locker);
					//console.log('spaceResultAsJSON.locker == req.body.key: ' + (spaceResultAsJSON.locker == req.body.key));
					//console.log('spaceResultAsJSON.locker === req.body.key: ' + (spaceResultAsJSON.locker === req.body.key));

					if(err) {
						res.send(err);
					} else {
						var result = false;
						if(spaceResultAsJSON.locker == req.body.key) {
							result = true;
						}
						res.json({pass: result});
					}
				});
		});

	app.use('/api/wvr/space', router);

};

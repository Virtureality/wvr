'use strict';

var mean = require('meanio');

var mongoose = require('mongoose'),
	SpaceModel = mongoose.model('Space');

function assembleSpace(space, req) {
	if(req.body) {
		var spaceObj = req.body;

		//console.log('spaceObj:' + JSON.stringify(spaceObj));
		/*for(var prop in spaceObj) {
			console.log('spaceObj.' + prop + ': ' + spaceObj[prop]);
		}*/

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

	 // middleware specific to this router
	 /*router.use(function timeLog(req, res, next) {
	 	console.log('Time: ', Date.now());
	 	next();
	 });*/

	router.route('/spaces')
		.get(function(req, res, next) {
			SpaceModel
				.find(function(err, spaces) {
					if(err) {
						res.send(err);
					} else {
						res.json(spaces);
					}
				})
				.populate('owner', 'email name');
		})
		.post(function(req, res, next) {
			var space = new SpaceModel();

			space = assembleSpace(space, req);

			space.save(function(err) {
				if(err) {
					res.send(err);
				} else {
					//res.json({message: 'Space Created!'});
					res.json({"message": 'Space Created!', "space": space});
				}
			});
			/*SpaceModel.create(req.body, function(err, result) {
				if(err) {
					res.send(err);
				} else {
					res.json({"message": 'Space Created!', "space": result});
				}
			});*/

		});

	/**/
	router.route('/spaces/:spaceId')
		.get(function(req, res, next) {
			/*SpaceModel.findById(req.params.spaceId, function(err, space) {
				if(err) {
					res.send(err);
				} else {
					res.json(space);
				}
			});*/
			/*SpaceModel.findOne({ uuid: req.params.spaceId }, function(err, space) {
				if(err) {
					res.send(err);
				} else {
					res.json(space);
				}
			});*/
			SpaceModel
				//.findOne({ uuid: req.params.spaceId }, '-__v', function(err, space) {
				.findOne({ uuid: req.params.spaceId }, function(err, space) {
					if(err) {
						res.send(err);
					} else {
						res.json(space);
					}
				})
				/* select() below has no effect, why[not supported in the version]?*/
				//.select('-__v -type')
				//.select({ type: 0 })
				//.select('uuid name owner')
			    //.populate('owner');
			    //.populate('owner', 'email name');
				.populate('owner', '_id email name');
		})
		.put(function(req, res, next) {
			//SpaceModel.findById(req.params.spaceId, function(err, space) {
			/*SpaceModel.findOne({ uuid: req.params.spaceId }, function(err, space) {
				if(err) {
					res.send(err);
				} else {
					space = assembleSpace(space, req);

					space.save(function(err) {
						if(err) {
							res.send(err);
						} else {
							//res.json({message: 'Space Updated!'});
							res.json({"message": 'Space Updated!', "space": space});
						}
					});
				}
			});*/
			/*SpaceModel.update({ uuid: req.params.spaceId }, req.body, function(err, result) {
				if(err) {
					res.send(err);
				} else {
					res.json({"message": 'Space Updated!', "space": result});
				}
			});*/
			SpaceModel.findOneAndUpdate({ uuid: req.params.spaceId }, req.body, function(err, result) {
				if(err) {
					res.send(err);
				} else {
					res.json({"message": 'Space Updated!', "space": result});
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
	 
	app.use('/wvr/api/space', router);

};

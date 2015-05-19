'use strict';

var mean = require('meanio');

var mongoose = require('mongoose'),
	SpaceModel = mongoose.model('Space');

function populateSpace(space, req) {
	if(req.body) {
		var spaceObj = req.body;

		//if(req.route.methods.post) {}

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

		if(spaceObj.facilities) {
			var facilities = spaceObj.facilities;
			if(facilities && Array.isArray(facilities)) {
				facilities.forEach(function(currentValue, index, array) {
					/*if(req.route.methods.post) {
					 space.facilities.push(currentValue);
					 }
					 else if(req.route.methods.put) {
					 if(currentValue._id && currentValue._id != '' && space.facilities.id(currentValue._id)) {
					 space.facilities.id(currentValue._id).update(currentValue);
					 } else {
					 space.facilities.push(currentValue);
					 }
					 }*/

					/**/
					var deleteFlag = false;
					if(req.route.methods.put && currentValue._id && currentValue._id != '' && space.facilities.id(currentValue._id)) {
						space.facilities.id(currentValue._id).remove();

						if(currentValue._delete) {
							deleteFlag = true;
						}
					}

					if(!deleteFlag) {
						space.facilities.push(currentValue);
					}

				});
			}
		}

		if(spaceObj.spaces) {
			var spaces = spaceObj.spaces;

			if(spaces && Array.isArray(spaces)) {
				spaces.forEach(function(currentValue, index, array) {
					var deleteFlag = false;
					if(req.route.methods.put && currentValue._id && currentValue._id != '' && space.spaces.id(currentValue._id)) {
						space.spaces.id(currentValue._id).remove();

						if(currentValue._delete) {
							deleteFlag = true;
						}
					}

					if(!deleteFlag) {
						space.spaces.push(currentValue);
					}
				});
			}
		}

	}

	return space;
}

function getSubSpace(topSpace, req) {

	var subSpaceIdKey = req.params.subSpaceId;
	if(req.params[0]) {
		subSpaceIdKey += req.params[0];
	}
	var subSpaceIdChain = subSpaceIdKey.split('/');
	var subSpaces = topSpace.spaces;
	var subSpace = topSpace;

	if(Array.isArray(subSpaceIdChain)) {
		subSpaceIdChain.forEach(function(currentValue, index, array) {
			subSpace = subSpaces.id(currentValue);
			if (subSpace) {
				subSpaces = subSpace.spaces;
			} else {
				return subSpace;
			}
		});
	}

	return subSpace;

}

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

			//space.uuid = space.id;

			space = populateSpace(space, req);

			space.save(function(err) {
				if(err) {
					res.send(err);
				} else {
					res.json({message: 'Space Created!'});
				}
			});

		});

	/**/
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
					space = populateSpace(space, req);

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

/* Note: The default 'Path-To-RegExp' version(1.0.3) for Express(4.11.1) doesn't support suffixed parameters,
 *       below(':subSpaceId*') is some kind of workaround ^-^ :(.
 *
 * Hints:
 * 1. Embedded documents may be not fit for the hierarchical/linked structure. */

	//router.route('/spaces/:spaceId/:subSpaceId+')
	//router.route('/spaces/:subSpaceId*')
	router.route('/spaces/:spaceId/:subSpaceId*')
		.get(function(req, res, next) {

			SpaceModel.findById(req.params.spaceId, function(err, space) {
				if(err) {
					res.send(err);
				} else {
					res.json(getSubSpace(space, req));
				}
			});
		})
		.put(function(req, res, next) {
			SpaceModel.findById(req.params.spaceId, function(err, space) {
				if(err) {
					res.send(err);
				} else {
					var subSpace = getSubSpace(space, req);
					populateSpace(subSpace, req);

					space.save(function(err) {
						if(err) {
							res.send(err);
						} else {
							res.json({message: 'SubSpace updated successfully!'});
						}
					});
				}
			});
		})
		.delete(function(req, res, next) {
			SpaceModel.findById(req.params.spaceId, function(err, space) {
				if(err) {
					res.send(err);
				} else {
					var subSpace = getSubSpace(space, req);
					//console.log('SubSpace to remove: ' + subSpace);
					subSpace.remove();

					space.save(function(err) {
						if(err) {
							res.send(err);
						} else {
							res.json({message: 'SubSpace deleted successfully!'});
						}
					});
				}
			});
		});

	router.route('/subspaces/:spaceId')
		.get(function(req, res, next) {

			//console.log('Retrieving subspaces for /subspaces/:spaceId...');

			SpaceModel.findById(req.params.spaceId, function(err, space) {
				if(err) {
					res.send(err);
				} else {
					res.json(space.spaces);
				}
			});
		})
		.post(function(req, res, next) {
			SpaceModel.findById(req.params.spaceId, function(err, space) {
				if(err) {
					res.send(err);
				} else {
					space.spaces.push(req.body);

					space.save(function(err) {
						if(err) {
							res.send(err);
						} else {
							res.json({message: 'SubSpace added successfully!'});
						}
					});
				}
			});
		});

	router.route('/subspaces/:spaceId/:subSpaceId*')
		.get(function(req, res, next) {

			//console.log('Retrieving subspaces for /subspaces/:spaceId/:subSpaceId* ...');

			/*
			for(var prop in req.params) {
			 console.log('req.params.' + prop + ': ' + req.params[prop]);
			}*/

			SpaceModel.findById(req.params.spaceId, function(err, space) {
				if(err) {
					res.send(err);
				} else {
					var parentSpace = getSubSpace(space, req);
					console.log('The parent space: ' + parentSpace);
					if(parentSpace) {
						res.json(parentSpace.spaces);
					} else{
						res.json({message: 'Space Not Found!'});
					}

				}
			});
		})
		.post(function(req, res, next) {
			SpaceModel.findById(req.params.spaceId, function(err, space) {
				if(err) {
					res.send(err);
				} else {
					var parentSpace = getSubSpace(space, req);
					console.log('The parent space: ' + parentSpace);
					if(parentSpace) {
						parentSpace.spaces.push(req.body);
					} else{
						res.json({message: 'Space Not Found!'});
					}

					space.save(function(err) {
						if(err) {
							res.send(err);
						} else {
							res.json({message: 'SubSpace added successfully!'});
						}
					});
				}
			});
		});

	router.get('/*', function(req, res, next) {
		res.json({message: 'Welcome to our REST API! :)'});
	});
	 
	app.use('/space', router);

};

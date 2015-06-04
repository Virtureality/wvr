'use strict';

var mean = require('meanio');

var mongoose = require('mongoose'),
	SpaceModel = mongoose.model('Space');

function populateSpace(space, req) {
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
				var originalSpaces = space.spaces;
				space.spaces = [];
				//console.log('originalSpaces: ' + JSON.stringify(originalSpaces));

				if(req.route.methods.put) {
					//console.log('Checking original spaces for keeping...');
					originalSpaces.forEach(function(currentValue, index, array) {
						/*
						console.log('Checking samples: ');
						var sampleArray = ["555b4998fadf8414116159e4", "555ab7d062ab0fbbf8102478"];
						var sampleElement = "555b4998fadf8414116159e4";
						console.log('sampleArray: ' + sampleArray);
						console.log('sampleElement: ' + sampleElement);
						console.log('Checking result 1: ' + sampleArray.indexOf(sampleElement) + ', which means: ' + (sampleArray.indexOf(sampleElement) != -1));
						console.log('Checking result 2: ' + sampleArray.indexOf(currentValue.toString()) + ', which means: ' + (sampleArray.indexOf(currentValue.toString()) != -1));
						console.log('Checking result 3: ' + spaces.indexOf(sampleElement) + ', which means: ' + (spaces.indexOf(sampleElement) != -1));
						 */
						/*
						console.log('In spaces: ' + spaces);
						console.log('Checking space: ' + currentValue.toString());
						console.log('Checking result: ' + spaces.indexOf(currentValue.toString()) + ', which means: ' + (spaces.indexOf(currentValue.toString()) != -1));
						*/
						if (spaces.indexOf(currentValue.toString()) != -1) {
							//console.log('Keeping space: ' + currentValue.toString());
							space.spaces.push(currentValue);
						}
					});
				}

				spaces.forEach(function(currentValue, index, array) {
					if(req.route.methods.put) {
						if(originalSpaces.indexOf(currentValue) == -1) {
							space.spaces.push(currentValue);
						}
					} else if(req.route.methods.post) {
						/*console.log('Finding space by Id: ' + currentValue + ' for referencing.');
						SpaceModel.findById(currentValue, function(err, refSpace) {
							if(err) {
								console.log("Error happened: " + err);
							} else if(refSpace) {
								console.log('Found space: ' + refSpace + ' for referencing.');
								space.spaces.push(currentValue);
							}
						});*/
						space.spaces.push(currentValue);
					}
				});

				//console.log('space.spaces:' + space.spaces);
			}
		}

	}

	return space;
}

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
					//res.json({message: 'Space Created!'});
					res.json({"message": 'Space Created!', "space": space});
				}
			});
			/*SpaceModel.create(space, function(err, createdSpace) {
				if(err) {
					res.send(err);
				} else {
					res.json({message: 'Space Created!', space: createdSpace});
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
			SpaceModel.findOne({ uuid: req.params.spaceId }, function(err, space) {
				if(err) {
					res.send(err);
				} else {
					res.json(space);
				}
			});
		})
		.put(function(req, res, next) {
			//SpaceModel.findById(req.params.spaceId, function(err, space) {
			SpaceModel.findOne({ uuid: req.params.spaceId }, function(err, space) {
				if(err) {
					res.send(err);
				} else {
					space = populateSpace(space, req);

					space.save(function(err) {
						if(err) {
							res.send(err);
						} else {
							//res.json({message: 'Space Updated!'});
							res.json({"message": 'Space Updated!', "space": space});
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
	 
	app.use('/wvr/api/space', router);

};

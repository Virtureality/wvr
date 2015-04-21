'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Otmit, app, auth, database) {
	
	var OpenTok = require('opentok');
	var apiKey = '45210232';
	var apiSecret = 'd16327e8c5996b546591a73f40cd6af52b167ef8';
	var opentok = new OpenTok(apiKey, apiSecret);

	//var rooms = new Map();
	
	if(!app.get('rooms')) {
		app.set('rooms', {});
	}
	
	function afterRoomGet(room, res, next) {
		
		  //console.log('Room got: id=' + room.id + ', sessionId=' + room.sessionId);
		  var token;
		  if(room.sessionId) {
			  token = opentok.generateToken(room.sessionId);
		  }
		  
		  Otmit.render('mit', {
			  apiKey: apiKey,
	          sessionId: room.sessionId,
	          token: token
	        }, function(err, html) {
	          //Rendering a view from the Package server/views
	          res.send(html);
	        });
		  
	}

	  // Home route
	  app.route('/otmit')
	    .get(function(req, res, next) {
	    	Otmit.render('index', {
	            rooms: app.get('rooms')
	          }, function(err, html) {
	            //Rendering a view from the Package server/views
	            res.send(html);
	          });
	        });

	  app.route('/otmit/mit/:roomId')
	  .get(function(req, res, next) {
		      var roomId = req.params.roomId;
			  //console.log('roomId:' + roomId);
				
				var rooms = app.get('rooms');
				var room = {id: roomId};
				
				if(rooms[roomId]) {
					room = rooms[roomId];
				} else {
					rooms[roomId] = room;
				}
				
				//console.log('room.sessionId:' + room.sessionId);
				
				if(!room.sessionId) {
					//console.log('Creating OT session...');
					opentok.createSession(function(err, session) {
						//console.log('session:', session);
						if(err) {
							console.log(err);
						} else {
							room.sessionId = session.sessionId;
						}
						
						//console.log('Result room: id=' + room.id + ', sessionId=' + room.sessionId);
						afterRoomGet(room, res, next);
						
					});
				} else {
					//console.log('Result room: id=' + room.id + ', sessionId=' + room.sessionId);
					afterRoomGet(room, res, next);
				}
	      });
	  
};

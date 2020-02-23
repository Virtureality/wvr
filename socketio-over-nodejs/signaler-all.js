var fs = require('fs');

var _static = require('node-static');
var file = new _static.Server('./static', {
    cache: false
});

var app = require('http').createServer(serverCallback);

function serverCallback(request, response) {
    request.addListener('end', function () {
        response.setHeader('Access-Control-Allow-Origin', '*');
        response.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        file.serve(request, response);
    }).resume();
}

var io = require('socket.io').listen(app, {
    log: true,
    origins: '*:*'
});

io.set('transports', [
    // 'websocket',
    'xhr-polling',
    'jsonp-polling'
]);

//Channel is the domain equivalence to socketio Namespace here
var channels = {};

var persistenceEnabled = process.env.PERSISTENCE_ENABLED || false;
var persistenceManager;

/*** Begin Initialization ***/
if(persistenceEnabled) {
	//ADD: Persistence initialization logic
	//persistenceManager = require('./controllers/socketPersistenceManager');
	// persistenceManager.init(function() { });
}
/*** End Initialization ***/

/// Set up the default namespace "/"|io.sockets|io, for checking and setting up custom namespaces|channels.
io.sockets.on('connection', function (socket) {

    socket.on('channel:presence', function (channel) {
        var isChannelPresent = !! channels[channel];
        socket.emit('channel:presence', isChannelPresent);
    });

    socket.on('channel:setup', function (data) {
        if (!channels[data.channel]) {

            setupNamespace(data.channel);
            
            if(persistenceEnabled) {
            	//TODO: Persist logic here for new-channel
            	// persistenceManager.create(data, function(err, result) { });
            }
        }
    });
    
});

/// Set up custom namespace|channel, for room manipulation and room-based signaling.
function setupNamespace(channel) {
    var nsp = io.of('/' + channel);
    
	channels[channel] = {rooms: {}};
    
    nsp.on('connection', function (socket) {
        
        socket.emit('channel:connected', true);
        
        socket.on('room:setup', function (data) {
        	
            if(channels[channel].rooms[data.roomid]) {
            	socket.emit('room:isOpen', true);
            } else {
            	
            	channels[channel].rooms[data.roomid] = data;
            	socket.join(data.roomid);
            	socket.broadcast.emit('room:isOpen', true);
                
                if(persistenceEnabled) {
                	//TODO: Persist logic here for new-channel
                	// persistenceManager.createRoom(data, function(err, result) { });
                }
            }
        });
        
        socket.on('room:isOpen', function (roomid) {
        	
        	var isRoomOpen = !! channels[channel].rooms[roomid];
                
            socket.emit('room:isOpen', isRoomOpen);
        });

        socket.on('room:join', function (data) {
        	
        	socket.join(data.roomid);
                
            socket.to(data.roomid).emit('user:joined', data);
        });
        
        socket.on('message', function(data) {
        	if(data.roomid) {
        		socket.to(data.roomid).emit('message', data);
        	} else {
        		socket.broadcast.emit('message', data);
        	}
        });
        
        socket.on('room:leave', function (data) {
        	if(data.leaveall) {
        		for(var room in socket.rooms) {
        			socket.leave(room);
        		}
        		socket.broadcast.emit('user:left', data);
        	} else if(data.roomid) {
        		socket.leave(data.roomid);
        		socket.to(data.roomid).emit('user:left', data);
        	}
        });
        
        socket.on('disconnect', function(user) {
            socket.broadcast.emit('user:left', user);
        });
    });
    
    nsp.emit('channel:presence', true);
}

app.listen(8888);

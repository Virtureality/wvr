var fs = require('fs');

var _static = require('node-static');
var file = new _static.Server('./static', {
    cache: false
});

var options = {
    key: fs.readFileSync('sslcert/letsencrypt/privkey.key'),
    cert: fs.readFileSync('sslcert/letsencrypt/fullchain.crt')
};

var app = require('https').createServer(options, serverCallback);

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
    'websocket',
    'xhr-polling',
    'jsonp-polling'
]);

var channels = {};

io.sockets.on('connection', function (socket) {
    var initiatorChannel = '';
    if (!io.isConnected) {
        io.isConnected = true;
    }

    socket.on('new-channel', function (data) {
        if (!channels[data.channel]) {
            initiatorChannel = data.channel;
        }

        channels[data.channel] = data.channel;
        onNewNamespace(data.channel, data.sender);
    });

    socket.on('presence', function (channel) {
        var isChannelPresent = !! channels[channel];
        socket.emit('presence', isChannelPresent);
    });

    socket.on('disconnect', function (channel) {
         if (initiatorChannel) {
            delete channels[initiatorChannel];
        }
    });
});

function onNewNamespace(channel, sender) {
    var nsp = io.of('/' + channel);

    nsp.on('connection', function (socket) {
        //console.log('nsp ' + channel + ' is connecting by socket#' + socket.id);

        var username;

        if (io.isConnected) {
            io.isConnected = false;
            socket.emit('connect', true);
        }

        socket.on('message', function (data) {
            //console.log('on message: ' + JSON.stringify(data));

            if (data.sender == sender) {
                if(!username) username = data.data.sender;
                
                socket.broadcast.emit('message', data.data);

                if(data.data.isDisconnectSockets || data.data.sessionClosed || data.data.left) {
                   /* console.log('Disconnecting socket#' + socket.id + '] for user: ' + data.data.userid);

                    console.log('Leaving rooms: ');*/

                    if(nsp && nsp.manager && nsp.manager.rooms) {
                        //console.log('Before, nsp.manager.rooms: ' + JSON.stringify(nsp.manager.rooms));

                        var roomsToCheck = nsp.manager.rooms;
                        var roomNamesToCheck = Object.getOwnPropertyNames(roomsToCheck);
                        var participants;
                        var participantIndex;
                        var roomId;

                        roomNamesToCheck.forEach(function(element, index, array) {
                            participants = roomsToCheck[element];

                            //console.log('Participants in room[' + element + ']: ' + JSON.stringify(element));

                            participantIndex = participants.indexOf(socket.id);

                            if(participantIndex !== -1) {

                                //console.log('Participant[' + participants[participantIndex] + ' is leaving room: ' + element);

                                participants.splice(participantIndex, 1);
                            }

                            roomId = element.substr(element.lastIndexOf('/') + 1, element.length);
                            socket.leave(roomId);
                            socket.disconnect();
                        });
                        //console.log('After, nsp.manager.rooms: ' + JSON.stringify(nsp.manager.rooms));
                    }

                    //socket.disconnect();
                }

            }

            if(data.data.msgType === 'fixRTCRoom') {
                var roomId = data.data.roomId;

                //console.log(data.userid + ' is trying to fix the room: ' + roomId + ' via socket#' + socket.id);

                if(nsp && nsp.manager && nsp.manager.rooms) {
                    //console.log('Before, nsp.manager.rooms: ' + JSON.stringify(nsp.manager.rooms));
                    if (nsp.manager.rooms['/wvrmit/' + roomId]) {
                        delete nsp.manager.rooms['/wvrmit/' + roomId];

                        socket.emit('message', {
                            customMessage: true,
                            message: {
                                msgType: 'rtcRoomFixed',
                                roomId: data.roomId,
                                requester: data.sender
                            }
                        });
                    }
                    //console.log('After, nsp.manager.rooms: ' + JSON.stringify(nsp.manager.rooms));
                }
            }

        });
        
        socket.on('disconnect', function() {
            //console.log(' disconnect:  via socket#' + socket.id);
            if(username) {
                socket.broadcast.emit('user-left', username);
                username = null;
            }

        });

        socket.on('room-reached', function(data) {//Why multiple times?

            //console.log(data.userid + ' reached room: ' + data.room + ' via socket#' + socket.id);

            if(nsp && nsp.manager && nsp.manager.rooms) {
                //console.log('Before, nsp.manager.rooms: ' + JSON.stringify(nsp.manager.rooms));
                if (nsp.manager.rooms['/wvrmit/' + data.room] && nsp.manager.rooms['/wvrmit/' + data.room].indexOf(socket.id) !== -1) {
                    //console.log('Already joined. Ignore.');
                } else {
                    if (!nsp.manager.rooms['/wvrmit/' + data.room] || nsp.manager.rooms['/wvrmit/' + data.room].length <= 0) {//Nobody in room
                        socket.emit('message', {
                            customMessage: true,
                            message: {
                                msgType: 'initiateRoom',
                                roomId: data.room,
                                initiator: data.userid
                            }
                        });
                    }
                    socket.join(data.room);
                }
                //console.log('After, nsp.manager.rooms: ' + JSON.stringify(nsp.manager.rooms));
            }
        });

    });
}

var nsp = io.of('/wvrmit');

nsp.on('connection', function (socket) {
    //console.log('nsp /wvrmit is connecting by socket#' + socket.id);

    if (io.isConnected) {
        io.isConnected = false;
        socket.emit('connect', true);
    }

    socket.on('message', function (data) {
        //console.log('on message: ' + JSON.stringify(data));

        socket.broadcast.emit('message', data.data);

        if(data.data.isDisconnectSockets || data.data.sessionClosed || data.data.left) {
            /* console.log('Disconnecting socket#' + socket.id + '] for user: ' + data.data.userid);

             console.log('Leaving rooms: ');*/

            if(nsp && nsp.manager && nsp.manager.rooms) {
                //console.log('Before, nsp.manager.rooms: ' + JSON.stringify(nsp.manager.rooms));

                var roomsToCheck = nsp.manager.rooms;
                var roomNamesToCheck = Object.getOwnPropertyNames(roomsToCheck);
                var participants;
                var participantIndex;

                roomNamesToCheck.forEach(function(element, index, array) {
                    participants = roomsToCheck[element];

                    //console.log('Participants in room[' + element + ']: ' + JSON.stringify(element));

                    participantIndex = participants.indexOf(socket.id);

                    if(participantIndex !== -1) {

                        //console.log('Participant[' + participants[participantIndex] + ' is leaving room: ' + element);

                        participants.splice(participantIndex, 1);
                    }
                });
                //console.log('After, nsp.manager.rooms: ' + JSON.stringify(nsp.manager.rooms));
            }
        }

        if(data.data.customMessage && data.data.message && data.data.message.msgType === 'fixRTCRoom') {
            var roomId = data.data.message.roomId;

            //console.log(data.sender + ' is trying to fix the room: ' + roomId + ' via socket#' + socket.id);

            if(nsp && nsp.manager && nsp.manager.rooms) {
                //console.log('Before, nsp.manager.rooms: ' + JSON.stringify(nsp.manager.rooms));
                if (nsp.manager.rooms['/wvrmit/' + roomId]) {
                    delete nsp.manager.rooms['/wvrmit/' + roomId];

                    socket.emit('message', {
                        customMessage: true,
                        message: {
                            msgType: 'rtcRoomFixed',
                            roomId: roomId,
                            requester: data.sender
                        }
                    });
                }
                //console.log('After, nsp.manager.rooms: ' + JSON.stringify(nsp.manager.rooms));
            }
        }

    });

    socket.on('disconnect', function() {
        console.log(' disconnect:  via socket#' + socket.id);
        //socket.broadcast.emit('user-left', username);
        //socket.disconnect();

    });

    socket.on('room-reached', function(data) {//Why multiple times?

        //console.log(data.userid + ' reached room: ' + data.room + ' via socket#' + socket.id);

        if(nsp && nsp.manager && nsp.manager.rooms) {
            //console.log('Before, nsp.manager.rooms: ' + JSON.stringify(nsp.manager.rooms));
            if (nsp.manager.rooms['/wvrmit/' + data.room] && nsp.manager.rooms['/wvrmit/' + data.room].indexOf(socket.id) !== -1) {
                //console.log('Already joined. Ignore.');
            } else {
                if (!nsp.manager.rooms['/wvrmit/' + data.room] || nsp.manager.rooms['/wvrmit/' + data.room].length <= 0) {//Nobody in room
                    socket.emit('message', {
                        customMessage: true,
                        message: {
                            msgType: 'initiateRoom',
                            roomId: data.room,
                            initiator: data.userid
                        }
                    });
                }
                socket.join(data.room);
            }
            //console.log('After, nsp.manager.rooms: ' + JSON.stringify(nsp.manager.rooms));
        }
    });

});

var nspScreen = io.of('/wvrmit-screen');

nspScreen.on('connection', function (socket) {
    //console.log('nsp /wvrmit-screen is connecting by socket#' + socket.id);

    if (io.isConnected) {
        io.isConnected = false;
        socket.emit('connect', true);
    }

    socket.on('message', function (data) {
        //console.log('on message: ' + JSON.stringify(data));

        socket.broadcast.emit('message', data.data);

    });

});

app.listen(8888);
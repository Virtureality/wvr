$(function(){

	var config = {
	    openSocket: function (socketConfig) {

	        var channel = socketConfig.channel || defaultChannel;

	        io.connect(SIGNALING_SERVER).emit('new-channel', {
	            channel: channel,
	            sender: sender
	        });

	        var socket = io.connect(SIGNALING_SERVER + channel);
	        socket.channel = channel;
	        socket.on('connect', function () {
	            if (socketConfig.callback) socketConfig.callback(socket);
	        });

	        socket.send = function (message) {
	            socket.emit('message', {
	                sender: sender,
	                data: message
	            });
	        };

	        socket.on('message', socketConfig.onmessage);
	    },
	    onRemoteStream: function (media) {
	        var video = media.video;
	        video.setAttribute('controls', true);
	        video.setAttribute('id', media.stream.id);
	        addVideoToBox(video);
	        video.play();
	    },
	    onRemoteStreamEnded: function (stream) {
	        var video = document.getElementById(stream.id);
	        if (video) video.parentNode.parentNode.removeChild(video.parentNode);
	    },
	    onRoomFound: function (room) {
            //console.log('Room: ' + room.roomName + ' found for joining...');
            //console.log('Room: ' + room.roomName + ' joined? : ' + roomJoined);
            console.log('Room found: ');
            for (var item in room) {
            	console.log(item + ': ' + room[item]);
            }

            var mname = $('#mname').attr('value');
            //console.log('mname: ' + mname);

	        if(roomJoined || room.roomName !== mname) {
	        	return;
	        } else{
	        	roomJoined = true;
		        disableButton(setupButton, 'Conference ongoing...');
		        var broadcaster = room.broadcaster;
		        captureUserMedia(function () {
		            conferenceUI.joinRoom({
		                roomToken: broadcaster,
		                joinUser: broadcaster
		            });
		            dataCon.check(mname);
		            //dataCon.join(room);
		        });
	        }

	    }
	};

    var SIGNALING_SERVER = 'http://localhost:8888/';
	var defaultChannel = 'wvrmit';
	var sender = Math.round(Math.random() * 999999999) + 999999999;
	var conferenceUI = conference(config);

	var dataCon = new DataConnection('wvrmit-data');
	/*dataCon.openSignalingChannel = function(callback) {
	    return io.connect(SIGNALING_SERVER + defaultChannel).on('message', callback);
	};*/
	/*dataCon.openSignalingChannel = function(callback) {
        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: 'wvrmit-data',
            sender: sender
        });
		//return io.connect(SIGNALING_SERVER).on('message', callback);
		return io.connect(SIGNALING_SERVER + 'wvrmit-data').on('message', callback);
	};*/
	dataCon.openSignalingChannel = function (socketConfig) {
		//console.log('socketConfig for the data connection: ' + JSON.stringify(socketConfig));
		console.log('socketConfig for the data connection: ' + socketConfig);
		console.log('socketConfig.onmessage: ' + socketConfig.onmessage);

        var channel = socketConfig.channel || 'wvrmit-data';

        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: channel,
            sender: sender
        });

        var socket = io.connect(SIGNALING_SERVER + channel);
        socket.channel = channel;
        /*
        socket.on('connect', function () {
            if (socketConfig.callback) socketConfig.callback(socket);
        });*/

        socket.send = function (message) {
            socket.emit('message', {
                sender: sender,
                data: message
            });
        };

        socket.on('message', socketConfig.onmessage);

        return socket;
    }
	// "chat" is your firebase id
    //dataCon.firebase = 'signaling';
	/*var user = $('#user').attr('value');
	if (user && user !== '') {
		dataCon.userid = user;
	}*/
	dataCon.userid = sender;
	var messageArea = $('#message-area');
	/*dataCon.onopen = function(e) {
		console.log('Data connection opened between you and ' + e.userid);
	};*/
	dataCon.onmessage = function(message, userid) {
		console.log(' message received from ' + userid + ': ' + message);
		messageArea.append($('<div>').append(userid + ': ' + message));
	};
	dataCon.onerror = function(e) {
		console.debug('Error in data connection. Target user id', e.userid, 'Error', e);
	};
	dataCon.onclose = function(e) {
		console.log('Data connection closed. Target user id: ' + e.userid);
	};
	dataCon.onuserleft = function(e) {
		console.log('User left. Target user id: ' + e.userid);
	};

	// check pre-created data connections
    //dataCon.check('wvrmit');

	var videosContainer = document.getElementById('container');
	var roomJoined = false;
	var setupButton = document.getElementById('setup-new-room');
	setupButton.onclick = function () {
		var mname = $('#mname').attr('value') || 'Anonymous';
	    disableButton(this, 'Conference ongoing...');
	    captureUserMedia(function () {
	        conferenceUI.createRoom({
	            roomName: mname
	        });
	        //setupDataCon(dataCon, mname);
	        dataCon.setup(mname);
	        //dataCon.check(mname);
	        roomJoined = true;
	    });
	};

	$('#send-msg-btn').on('click', function() {
		var msgBody = $('#message-text').val() || '';
		if (msgBody && msgBody !== '') {
			console.log('Sending message: ' + msgBody);
			dataCon.send(msgBody);
			//dataCon.send(msgBody, defaultChannel);
			messageArea.append($('<div>').append('Me: ' + msgBody));
		} else{
			alert('Please input message content correctly!');
		}
	});

	function captureUserMedia(callback) {
	    var video = document.createElement('video');
	    video.setAttribute('autoplay', true);
	    video.setAttribute('controls', true);

	    addVideoToBox(video);

	    getUserMedia({
	        video: video,
	        onsuccess: function (stream) {
	            config.attachStream = stream;
	            video.setAttribute('muted', true);
	            callback();
	        }
	    });
	}

	function setupDataCon(connection, roomid) {
		console.log('Setting up data connection{user: ' + connection.userid + '}, channel: ' + connection.channel + ' for room: ' + roomid);

		connection.setup(roomid);
		// check pre-created data connections
        //connection.check(roomid);
	};

	function addVideoToBox(video) {

        video.setAttribute('height', '100%');
        video.setAttribute('width', '100%');

        var videoBox = document.createElement('div');
        videoBox.setAttribute('class', 'box photo col2 masonry-brick');

        videoBox.appendChild(video);

	    videosContainer.appendChild(videoBox);

	    $('#container').masonry('appended', videoBox);
	}

	function disableButton(button, text) {
		if(button) {
			if(text && text !== '') {
				button.innerHTML = text;
			}
		    button.disabled = true;
	    }
	}

});
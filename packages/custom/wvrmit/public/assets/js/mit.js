$(function(){

	var config = {
	    openSocket: function (config) {
	        /*var SIGNALING_SERVER = 'https://webrtc-signaling.nodejitsu.com:443/',
	            defaultChannel = location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');*/
	        var SIGNALING_SERVER = 'http://localhost:8888/',
	            defaultChannel = 'wvrmit';

	        var channel = config.channel || defaultChannel;
	        var sender = Math.round(Math.random() * 999999999) + 999999999;

	        io.connect(SIGNALING_SERVER).emit('new-channel', {
	            channel: channel,
	            sender: sender
	        });

	        var socket = io.connect(SIGNALING_SERVER + channel);
	        socket.channel = channel;
	        socket.on('connect', function () {
	            if (config.callback) config.callback(socket);
	        });

	        socket.send = function (message) {
	            socket.emit('message', {
	                sender: sender,
	                data: message
	            });
	        };

	        socket.on('message', config.onmessage);
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
		        });
	        }

	    }
	};

	var conferenceUI = conference(config);

	var videosContainer = document.getElementById('container');
	var roomJoined = false;
	var setupButton = document.getElementById('setup-new-room');
	setupButton.onclick = function () {
	    disableButton(this, 'Conference ongoing...');
	    captureUserMedia(function () {
	        conferenceUI.createRoom({
	            roomName: $('#mname').attr('value') || 'Anonymous'
	        });
	        roomJoined = true;
	    });
	};

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
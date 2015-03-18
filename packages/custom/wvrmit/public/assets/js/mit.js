$(function(){

	function uniqueToken() {
        var s4 = function() {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

	//var userToken = Math.round(Math.random() * 999999999) + 999999999;
	var userToken = uniqueToken();

	var confOnGoing = false;

    var actionArea = $('#action-area');
    var actionButton = $('#action-button');

	var container = $('#container');

	var videoConfJoined = false;
    var videoConfUI;
	var videoConfConfig = {

	    openSocket: openSignaling,
	    onRemoteStream: function (media) {
	        /*var video = media.video;
	        video.setAttribute('controls', true);
	        video.setAttribute('id', media.stream.id);
	        video.setAttribute('muted', true);
	        addVideo($(video), container);
	        video.play();*/
	        var video = $(media.video).attr('id', media.stream.id).attr('controls', true);
	        media.video.play();
	        addVideo(video, container);
	    },
	    onRemoteStreamEnded: function (stream) {
	        var video = document.getElementById(stream.id);
	        if (video) video.parentNode.parentNode.removeChild(video.parentNode);
	    },
	    onRoomFound: function (room) {
            /*console.log('Room found: ');
            for (var item in room) {
            	console.log(item + ': ' + room[item]);
            }*/
            var mname = $('#mname').attr('value') || 'Anonymous';

	        if(videoConfJoined || room.roomName !== mname) {
	        	return;
	        } else{
	        	confOnGoing = true;

	        	videoConfJoined = true;
		        setButton(actionButton, 'Video Conference Ongoing...', true);

		        var broadcaster = room.broadcaster;
		        captureUserMedia(function () {
		            videoConfUI.joinRoom({
		                roomToken: broadcaster,
		                joinUser: broadcaster
		            });
		        });
	        }

	    }
	};

	var dataConnectionJoined = false;

	var SIGNALING_SERVER = 'http://localhost:8888/';
	//var SIGNALING_SERVER = '127.0.0.1:8888/';
    //var SIGNALING_SERVER = 'http://192.168.0.109:8888/';
	var defaultChannel = 'wvrmit';
    
	/*var loginUser = $('#user').attr('value');
	var sender;
	console.log('global.user.name:' + '{{global.user.name}}');
	if (loginUser && loginUser != '{{global.user.name}}') {
		sender = loginUser;
	} else{
		sender = Math.round(Math.random() * 999999999) + 999999999;
	}*/

	watch();

	function setup() {

		setButton(actionButton, 'Setup', false);

		actionButton.bind('click', doSetup);

		function doSetup() {

		    setButton(actionButton, 'Setting up ...', true);

		    var mname = $('#mname').attr('value') || 'Anonymous';

		    setupVideoConf(mname, userToken);

		    /*setupDataConnection(mname, userToken);

		    enableShare(mname);*/

		    actionButton.unbind('click', doSetup);

		    //console.log('setup event handler execution ended.');

		}
		
		/*actionButton.on('click', function() {

		    setButton(actionButton, 'Setting up ...', true);

		    var mname = $('#mname').attr('value') || 'Anonymous';

		    setupVideoConf(mname, userToken);

		    console.log('setup event handler execution ended.');

		});*/

		function setupVideoConf(mname, setter) {

			//console.log('Setting up videoConf...');

			captureUserMedia(function () {
				//console.log('createRoom ongoing...');
		        videoConfUI.createRoom({
		            roomName: mname,
		            userToken: userToken
		        });
		        setButton(actionButton, 'Video Conference Ongoing...', true);

		        videoConfJoined = true;
		    });
		}

		function setupDataConnection(mname, setter){
			return;
		}

		function enableShare(mname){
			return;
		}

	}

	function watch() {
		    
    	userToken = setUserToken(userToken);
        //console.log('userToken set to: ' + userToken);

		setButton(actionButton, 'Watch', false);

		/*actionButton.on('click', function() {

		    var mname = $('#mname').attr('value') || 'Anonymous';

	        startWatching(mname);

		    setButton(actionButton, 'Watching ...', true);

		});*/

		actionButton.bind('click', doWatch);

		function doWatch() {

		    var mname = $('#mname').attr('value') || 'Anonymous';

	        startWatching(mname);

	        actionButton.unbind('click', doWatch);

		    setButton(actionButton, 'Watching ...', true);

		}

		function startWatching(mname) {
			//videoConfUI = conference(videoConfConfig);
			videoConfUI = conference(videoConfConfig, userToken);
		};

	}

	function setButton(button, text, disable) {
		if(button) {
			if(text && text !== '') {
				button.text(text);
			}

		    button.attr('disabled', disable);
	    }
	}

	function openSignaling(socketConfig, forLibrary) {
		/*console.log('openSignaling with config: ');

		for (var item in socketConfig) {
			console.log(item + ': ' + socketConfig[item]);
		}
		console.log('forLibrary: ' + forLibrary);*/

        var channel = socketConfig.channel || defaultChannel;

        io.connect(SIGNALING_SERVER).emit('new-channel', {
            channel: channel,
            sender: userToken
        });

        /*console.log('io connecting to: ' + SIGNALING_SERVER);
        console.log('Emitted new-channel event: ' + ' channel-' + channel + ' sender-' + userToken);*/

        var socket = io.connect(SIGNALING_SERVER + channel);
        //console.log('io connecting to: ' + SIGNALING_SERVER + channel);
        socket.channel = channel;

        socket.send = function (message) {

        	//console.log('sender: ' + userToken + ' is sending event with message: ' + message);

            socket.emit('message', {
                sender: userToken,
                data: message
            });
        	//console.log('sender: ' + userToken + ' sent message: ' + message);
        };

        socket.on('message', socketConfig.onmessage);
        
        if (forLibrary) {
            return socket;
        } else{
        	var connected = false;

	        socket.on('connect', function () {
	        	if (!connected) {
	        		connected = true;
		        	//console.log('connected message received.');

		            if (socketConfig.callback) socketConfig.callback(socket);

		            /*console.log('socketConfig.callback: ' + socketConfig.callback);

	                console.log('socket:' + socket);
		            for (var item in socket) {
		                console.log(item + ':' + socket[item]);
		            }*/

		        	//setTimeout(checkForSetup, 3000);
		        	checkForSetup();
	        	}
	        });
        }
    }

    function checkForSetup() {
    	if (!confOnGoing) {
    		setup();
    	}
    }

    function setUserToken(userToken) {

    	var loginUser = window.user;
		//console.log('loginUser: ' + loginUser);
		if (loginUser && loginUser._id && loginUser._id !== '') {
			userToken = loginUser.username + '-' + loginUser._id;
		}

		return userToken;
    }

	function captureUserMedia(callback) {

	    var video = $('<video/>').attr('autoplay', true).attr('controls', true);

        addVideo(video, container);

	    getUserMedia({
	        video: video.get(0),
	        onsuccess: function (stream) {
	            videoConfConfig.attachStream = stream;
	            video.attr('muted', true);

	            callback();
	        }
	    });
	}

	function addVideo(video, container) {

		video.attr('height', '100%').attr('width', '100%');

        var videoBox = $('<div/>').attr('class', 'box photo col2 masonry-brick');
        video.appendTo(videoBox);
	    videoBox.appendTo(container);

	    container.masonry('appended', videoBox);
	}

});
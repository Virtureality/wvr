$(function(){

	function uniqueToken() {
        var s4 = function() {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

	//var userToken = Math.round(Math.random() * 999999999) + 999999999;
	var userToken = uniqueToken();

    var roomFound = false;
	var confOnGoing = false;

    var actionArea = $('#action-area');
    var actionButton = $('#action-button');

	var container = $('#container');

	var confJoined = false;
    var confUI;
    
	var dataConnectionJoined = false;
	//var dataCon = new DataConnection('wvrmit-data');
	var dataCon;

	var confConfig = {

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
	    	if(!roomFound) {
	    		roomFound =true;

	    		var mname = $('#mname').attr('value') || 'Anonymous';

		        if(confJoined || room.roomName !== mname) {
		        	return;
		        } else{
		        	confOnGoing = true;

			        setButton(actionButton, 'Conference Ongoing...', true);

			        var broadcaster = room.broadcaster;
			        captureUserMedia(function () {
			            confUI.joinRoom({
			                roomToken: broadcaster,
			                joinUser: broadcaster
			            });
	                    confJoined = true;

	                    if (!dataConnectionJoined) {
				            initDataConnection(mname, userToken);
				            //dataCon.join(room);
				            dataCon.check(mname);
				            dataConnectionJoined = true;
	                    };

			            enableShare(mname);
			        });
		        }
	    	}

	    }
	};

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

		    setupConf(mname, userToken);

		    actionButton.unbind('click', doSetup);

		    //console.log('setup event handler execution ended.');

		}

		function setupConf(mname, setter) {

			//console.log('Setting up videoConf...');

			captureUserMedia(function () {
				//console.log('createRoom ongoing...');
		        confUI.createRoom({
		            roomName: mname,
		            userToken: userToken
		        });

		        initDataConnection(mname, userToken);
	            dataCon.setup(mname);

		        enableShare(mname);

		        setButton(actionButton, 'Conference Ongoing...', true);

		        confJoined = true;
		    });
		}

	}	

	function initDataConnection(mname, setter){

	    //dataCon.firebase = 'signaling';
		//dataCon.userid = sender;
		var messageArea = $('#message-area');
		/*dataCon.onopen = function(e) {
			console.log('Data connection opened between you and ' + e.userid);
		};*/
		dataCon.onmessage = function(message, userid) {
			//console.log(' message received from ' + userid + ': ' + message);
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


        dataCon.userid = setter;

        var sendMsgButton = $('#send-msg-btn');
        sendMsgButton.on('click', function() {
			var msgBody = $('#message-text').val() || '';
			if (msgBody && msgBody !== '') {
				//console.log('Sending message: ' + msgBody);
				dataCon.send(msgBody);
				messageArea.append($('<div>').append('Me: ' + msgBody));
			} else{
				alert('Please input message content correctly!');
			}
		});

		setButton(sendMsgButton, 'Send', false);

	}

	function enableShare(mname){
		var shareLink = $('<a/>').attr('class', 'pull-left').attr('target', '_blank').attr('href', location.href).text('Share Meeting: ' + mname);
		shareLink.appendTo(actionArea);
	}

	function watch() {
		    
    	userToken = setUserToken(userToken);
        //console.log('userToken set to: ' + userToken);

		setButton(actionButton, 'Watch', false);

		//actionButton.bind('click', doWatch);
		setTimeout(doWatch, 1000);

		function doWatch() {

	        startWatching();

	        //actionButton.unbind('click', doWatch);

		    setButton(actionButton, 'Watching ...', true);

		}

		function startWatching() {
			
			confUI = conference(confConfig, userToken);

			dataCon = new DataConnection('wvrmit-data');
		    dataCon.openSignalingChannel = openSignaling;

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

		        	setTimeout(checkForSetup, 3000);
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
	            confConfig.attachStream = stream;
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
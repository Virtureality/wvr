$(function(){

	var SIGNALING_SERVER = window.signalingServer || 'http://localhost:8888/';
	//var SIGNALING_SERVER = window.signalingServer || '127.0.0.1:8888/';
	//var SIGNALING_SERVER = window.signalingServer || 'http://192.168.0.109:8888/';
	var defaultChannel = 'wvrmit';

	var wvrmitConnection;

	var actionArea = $('#action-area');
	var actionButton = $('#action-button');
	var container = $('#container');

	setTimeout(startWatching, 1000);

	function startWatching() {

		var mname = $('#mname').attr('value') || 'Anonymous';

		setButton(actionButton, 'Watching ...', true);

		var userID = getUserID();

		wvrmitConnection = new RTCMultiConnection(defaultChannel);

		wvrmitConnection.userid = userID;

		/*wvrmitConnection.openSignalingChannel = function (config) {
			//var channel = config.channel || defaultChannel;
			var channel = config.channel || this.channel;
			var sender = userID;

			io.connect(SIGNALING_SERVER).emit('new-channel', {
				channel: channel,
				sender: sender
			});

			var socket = io.connect(SIGNALING_SERVER + channel);
			socket.channel = channel;

			socket.send = function (message) {

				socket.emit('message', {
					sender: sender,
					data: message
				});
			};

			socket.on('message', config.onmessage);

			var connected = false;

			socket.on('connect', function () {
				if (!connected) {
					connected = true;

					if (config.callback) config.callback(socket);

					setTimeout(checkForSetup, 3000);
				}
			});
		};*/
		wvrmitConnection.openSignalingChannel = function (config) {
			config.channel = config.channel || this.channel;

			var socket = new Firebase('https://chat.firebaseIO.com/' + config.channel);
			socket.channel = config.channel;

			socket.on('child_added', function (data) {
				config.onmessage(data.val());
			});

			socket.send = function(data) {
				this.push(data);
			};

			config.onopen && setTimeout(config.onopen, 1);
			socket.onDisconnect().remove();
			/*var connectedRef = new Firebase("https://chat.firebaseIO.com/.info/connected");
			connectedRef.on("value", function(snap) {
				if (snap.val() === true) {
					//alert("connected");
					console.log('Connected to Firebase.');
					setTimeout(checkForSetup, 3000);
				} else {
					//alert("not connected");
					console.log('Disconnected from Firebase.');
				}
			});*/
			socket.child('.info/connected').on('value', function(connectedSnap) {
				if (connectedSnap.val() === true) {
					/* we're connected! */
					console.log('Connected to Firebase.');
					setTimeout(checkForSetup, 3000);
				} else {
					/* we're disconnected! */
					console.log('Disconnected from Firebase.');
				}
			});
			return socket;
		};

		wvrmitConnection.onstatechange = function(state) {
			// state.userid == 'target-userid' || 'browser'
			// state.extra  == 'target-user-extra-data' || {}
			// state.name  == 'short name'
			// state.reason == 'longer description'

			// fetching-usermedia
			// usermedia-fetched

			// detecting-room-presence
			// room-not-available
			// room-available

			// connecting-with-initiator
			// connected-with-initiator

			// failed---has reason

			// request-accepted
			// request-rejected

			console.log('wvrmitConnection status changed: ' + state.name);

			if(state.name == 'room-not-available') {
				setButton(actionButton, state.reason, true);
				wvrmitConnection.connect(mname);
			}

			if(state.name == 'room-available') {
				enableRequestToJoin();
			}

			if(state.name == 'request-accepted') {
				alert(state.reason);
				setButton(actionButton, 'Conference Ongoing...', true);
			}

			if(state.name == 'request-rejected') {
				alert(state.reason);
				enableRequestToJoin();
			}

			if(state.name == 'failed---has reason') {
				alert(state.reason);
			}
		};

		wvrmitConnection.onstream = function (event) {

			// e.mediaElement (audio or video element)
			// e.stream     native MediaStream object
			// e.streamid   unique identifier of the stream; synced among all users!
			// e.session    {audio: true, video: true, screen: true}
			// e.blobURL    blob-URI
			// e.type       "local" or "remote"
			// e.extra
			// e.userid      the person who shared stream with you!

			// e.isVideo ---- if it is a  Video stream
			// e.isAudio ---- if it is an Audio stream
			// e.isScreen --- if it is screen-sharing stream

			if(event.isVideo && (event.type == 'local' || event.userid != this.userid)) {
				var video = $(event.mediaElement).attr('id', event.streamid).attr('controls', true);
				addVideo(video, container);
			}
		};

		wvrmitConnection.onstreamended = function (e) {
			//var video = document.getElementById(stream.id);
			var video = document.getElementById(e.streamid);
			if (video) video.parentNode.parentNode.removeChild(video.parentNode);
		};

		//wvrmitConnection.transmitRoomOnce = true;
		wvrmitConnection.onNewSession = function (session) {

			//console.log('onNewSession: ' + session.sessionid);

			// session.userid
			// session.sessionid
			// session.extra
			// session.session i.e. {audio,video,screen,data}

			if (session.sessionid == mname) {
				setButton(actionButton, 'Joining ...', true);

				//wvrmitConnection.join(mname);
				wvrmitConnection.join(session);
			}

		};

		var messageArea = $('#message-area');

		var sendMsgButton = $('#send-msg-btn');

		sendMsgButton.on('click', function() {
			var msgBody = $('#message-text').val() || '';
			if (msgBody && msgBody !== '') {
				//console.log('Sending message: ' + msgBody);
				wvrmitConnection.send(msgBody);
				messageArea.append($('<div>').append('Me: ' + msgBody));
			} else{
				alert('Please input message content correctly!');
			}
		});

		wvrmitConnection.onopen = function(e) {
			// e.userid
			// e.extra

			//console.log('Data connection opened between you and: ' + e.userid);

			setButton(sendMsgButton, 'Send', false);
		}
		wvrmitConnection.onmessage = function(e) {
			// e.data     ---- translated text
			// e.original ---- original text
			// e.userid
			// e.extra

			//console.log('onmessage: ' + e);

			messageArea.append($('<div>').append(e.userid + ': ' + e.data));
		}

		//wvrmitConnection.fakeDataChannels = true;

		wvrmitConnection.connect();
		//wvrmitConnection.connect(mname);

	}

	function getUserID() {

		var loginUser = window.user;

		if (loginUser && loginUser._id && loginUser._id !== '') {
			return loginUser.username + '-' + loginUser._id;
		}

		return Math.round(Math.random() * 999999999) + 999999999;
	}

	function checkForSetup() {
		var ableToSetup = $('#ableToSetup').attr('value');

		if (ableToSetup == "true") {
			setup();
		}
	}

	function setup() {

		setButton(actionButton, 'Setup', false);

		actionButton.bind('click', doSetup);

		function doSetup() {

			setButton(actionButton, 'Setting up ...', true);

			var mname = $('#mname').attr('value') || 'Anonymous';

			wvrmitConnection.isInitiator = true;
			wvrmitConnection.onRequest = function(request) {
				var acceptDecision = confirm(request.userid + ' is requesting to join, would you like to accept?');

				wvrmitConnection.dontCaptureUserMedia = true;
				if(acceptDecision) {
					wvrmitConnection.accept(request);
				} else {
					wvrmitConnection.reject(request);
				}
			};
			wvrmitConnection.session = {
				audio: true,
				video: true,
				data:  true
			};
			wvrmitConnection.maxParticipantsAllowed = 256;
			wvrmitConnection.open(mname);

			enableShare(mname);

			setButton(actionButton, 'Conference Ongoing...', true);


			actionButton.unbind('click', doSetup);

		}

	}

	function enableRequestToJoin() {

		wvrmitConnection.dontCaptureUserMedia = true;

		setButton(actionButton, 'Request to Join', false);

		actionButton.bind('click', requestToJoinHandler);

		function requestToJoinHandler() {
			var mname = $('#mname').attr('value') || 'Anonymous';

			setButton(actionButton, 'Requesting to join ...', true);
			wvrmitConnection.join(mname);

			actionButton.unbind('click', requestToJoinHandler);

		}
	}

	function enableShare(mname){
		var shareLink = $('<a/>').attr('class', 'pull-left').attr('target', '_blank').attr('href', location.href).text('Share Meeting: ' + mname);
		shareLink.appendTo(actionArea);
	}

	function setButton(button, text, disable) {
		if(button) {
			if(text && text !== '') {
				button.text(text);
			}

			button.attr('disabled', disable);
		}
	}

	function addVideo(video, container) {

		video.attr('height', '100%').attr('width', '100%');

		var videoBox = $('<div/>').attr('class', 'box photo col2 masonry-brick');
		video.appendTo(videoBox);
		videoBox.appendTo(container);

		container.masonry('appended', videoBox);
	}

});

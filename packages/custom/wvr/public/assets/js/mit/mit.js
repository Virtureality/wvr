$(function(){

	var SIGNALING_SERVER = 'http://localhost:8888/';
	//var SIGNALING_SERVER = '127.0.0.1:8888/';
	//var SIGNALING_SERVER = 'http://192.168.0.109:8888/';
	var defaultChannel = 'wvrmit';

	var confOnGoing = false;
	var confJoined = false;
	var wvrmitConnection;
	//var wvrmitDataConnection;

	var actionArea = $('#action-area');
	var actionButton = $('#action-button');
	var container = $('#container');

	watch();

	function watch() {

		setTimeout(doWatch, 1000);

		function doWatch() {

			startWatching();

			setButton(actionButton, 'Watching ...', true);

		}

		function startWatching() {

			var userID = getUserID();

			wvrmitConnection = new RTCMultiConnection('wvrmit');

			wvrmitConnection.userid = userID;

			wvrmitConnection.openSignalingChannel = function (config) {
				var channel = config.channel || defaultChannel;

				io.connect(SIGNALING_SERVER).emit('new-channel', {
					channel: channel,
					sender: userID
				});

				var socket = io.connect(SIGNALING_SERVER + channel);
				socket.channel = channel;

				socket.send = function (message) {

					socket.emit('message', {
						sender: userID,
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

				if(state.name == 'request-accepted') {
					alert(state.reason);
					setButton(actionButton, 'Conference Ongoing...', true);
					initDataConnection();
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

				console.log('onNewSession ... ');

				// session.userid
				// session.sessionid
				// session.extra
				// session.session i.e. {audio,video,screen,data}

				var mname = $('#mname').attr('value') || 'Anonymous';

				if (session.sessionid == mname && session.userid != this.userid && !confJoined) {
					confOnGoing = true;

					setButton(actionButton, 'Joining ...', true);

					wvrmitConnection.join(mname);
					//initDataConnection();

					confJoined = true;
				}

			};

			wvrmitConnection.connect();

		};

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

		if (!confOnGoing && ableToSetup == "true") {
			setup();
		}
	}

	function setup() {

		setButton(actionButton, 'Setup', false);

		actionButton.bind('click', doSetup);

		function doSetup() {

			setButton(actionButton, 'Setting up ...', true);

			var mname = $('#mname').attr('value') || 'Anonymous';

			setupConf(mname);

			actionButton.unbind('click', doSetup);

		}

		function setupConf(mname) {

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
			wvrmitConnection.open(mname);

			enableShare(mname);

			setButton(actionButton, 'Conference Ongoing...', true);

			initDataConnection();

			confJoined = true;
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

	function initDataConnection(){

		var userID = getUserID();

		var messageArea = $('#message-area');

		var sendMsgButton = $('#send-msg-btn');

		wvrmitConnection.language = 'en'; // prefer English
		wvrmitConnection.autoTranslateText = true;

		wvrmitConnection.onCustomMessage = function(message) {
			messageArea.append($('<div>').append(message));
		};

		sendMsgButton.on('click', function() {
			var msgBody = $('#message-text').val() || '';
			if (msgBody && msgBody !== '') {
				wvrmitConnection.sendCustomMessage(userID + ':' + msgBody);
				messageArea.append($('<div>').append('Me: ' + msgBody));
			} else{
				alert('Please input message content correctly!');
			}
		});
		setButton(sendMsgButton, 'Send', false);

		/// Warning: send() and onmessage() as below doesn't work, why?
		/*var userID = getUserID();

		var messageArea = $('#message-area');

		var sendMsgButton = $('#send-msg-btn');

		//var channel = config.channel || defaultChannel;
		var channel = 'wvrmit' + 'data';

		wvrmitDataConnection = new RTCMultiConnection('wvrmit' + 'data');
		wvrmitDataConnection.openSignalingChannel = function (config) {

			io.connect(SIGNALING_SERVER).emit('new-channel', {
				channel: channel,
				sender: userID
			});

			var socket = io.connect(SIGNALING_SERVER + channel);
			socket.channel = channel;

			socket.send = function (message) {

				socket.emit('message', {
					sender: userID,
					data: message
				});
			};

			socket.on('message', config.onmessage);

			var connected = false;

			socket.on('connect', function () {
				if (!connected) {
					console.log('wvrmitDataConnection socket connected!');

					var mname = $('#mname').attr('value') || 'Anonymous';
					wvrmitDataConnection.open(mname);
					setButton(sendMsgButton, 'Opening ...', true);
					connected = true;

					if (config.callback) config.callback(socket);
				}
			});
		};
		wvrmitDataConnection.session = {
			data: true
		};
		wvrmitDataConnection.onstatechange = function(state) {
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

			console.log('wvrmitDataConnection status: ' + state.name);
		};

		wvrmitDataConnection.language = 'en'; // prefer English
		wvrmitDataConnection.autoTranslateText = true;

		wvrmitDataConnection.onopen = function() {
			sendMsgButton.on('click', function() {
				var msgBody = $('#message-text').val() || '';
				if (msgBody && msgBody !== '') {
					//console.log('Sending message: ' + msgBody);
					wvrmitDataConnection.send({msg: msgBody});
					//wvrmitConnection.send(msgBody);
					//wvrmitConnection.sendCustomMessage(msgBody);
					messageArea.append($('<div>').append('Me: ' + msgBody));
				} else{
					alert('Please input message content correctly!');
				}
			});
			setButton(sendMsgButton, 'Send', false);
			console.log('wvrmitDataConnection opened.');
		}
		wvrmitDataConnection.onmessage = function(e) {
			console.log('onmessage: ' + e);
			// e.data     ---- translated text
			// e.original ---- original text
			// e.userid
			// e.extra

			//console.log(' message received from ' + userid + ': ' + message);
			/!*userid = userid.substring(0, userid.lastIndexOf('-'));
			messageArea.append($('<div>').append(userid + ': ' + message));*!/
			messageArea.append($('<div>').append(e.userid + ': ' + e.data));
		};
		/!*wvrmitConnection.onCustomMessage = function(message) {
			// e.data     ---- translated text
			// e.original ---- original text
			// e.userid
			// e.extra

			//console.log(' message received from ' + userid + ': ' + message);
			/!*userid = userid.substring(0, userid.lastIndexOf('-'));
			 messageArea.append($('<div>').append(userid + ': ' + message));*!/
			messageArea.append($('<div>').append(message));
		};*!/
		/!*sendMsgButton.on('click', function() {
			var msgBody = $('#message-text').val() || '';
			if (msgBody && msgBody !== '') {
				//console.log('Sending message: ' + msgBody);
				wvrmitDataConnection.send({msg: msgBody});
				//wvrmitConnection.send(msgBody);
				//wvrmitConnection.sendCustomMessage(msgBody);
				messageArea.append($('<div>').append('Me: ' + msgBody));
			} else{
				alert('Please input message content correctly!');
			}
		});*!/

		/!*setButton(sendMsgButton, 'Connecting ...', true);
		wvrmitDataConnection.connect();*!/

		//setButton(sendMsgButton, 'Initializing ...', true);*/

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

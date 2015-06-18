$(function(){

	var roomsContainer = $('#meetingsContainer');

	//console.log('window.signalingServer: ' + window.signalingServer);
	var SIGNALING_SERVER = window.signalingServer || 'http://localhost:8888/';
	/*var SIGNALING_SERVER = window.signalingServer || 'https://webrtc-signaling.nodejitsu.com:443/';*/
	//var SIGNALING_SERVER = window.signalingServer || 'http://192.168.0.109:8888/';

	var wvrmitConnection = new RTCMultiConnection('wvrmit');

	wvrmitConnection.openSignalingChannel = function (config) {

		var channel = config.channel || this.channel;
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
	};
	/*wvrmitConnection.openSignalingChannel = function (config) {
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
		return socket;
	};*/

	wvrmitConnection.onNewSession = function (session) {

		/*console.log('New Session: ' + session.sessionid + ' found!');

		console.log('Adding new session ...');*/
		//console.log('onNewSession: ' + JSON.stringify(session));

		if(!session.left) {//To make sure it works only for real new session events. Note: This is only just a temporary workaround, good solution should be sth at RMC onmessage() level. TODO: To verify!!!
			var roomEntrance = document.createElement('a');
			roomEntrance.setAttribute('id', session.sessionid);
			roomEntrance.setAttribute('href', '#!/mit/' + session.sessionid);
			roomEntrance.setAttribute('target', '_blank');
			roomEntrance.innerHTML = session.sessionid;

			addToContainer(roomsContainer, roomEntrance);
		}

	};

	wvrmitConnection.onSessionClosed = function (e) {
		// entire session is closed

		// e.userid
		// e.extra
		// e.isSessionClosed

		// e.session == connection.sessionDescription
		// e.session.sessionid
		// e.session.userid --- initiator id
		// e.session.session -- {audio:true, video:true}

		//console.log('Session: ' + e.session.sessionid + ' closed!');
		//console.log('Before deleting[' + e.session.sessionid + '] wvrmitConnection.sessionDescriptions: ' + JSON.stringify(wvrmitConnection.sessionDescriptions));

		if(wvrmitConnection.sessionDescriptions[e.session.sessionid]) {
			//console.log('Deleting session ...');
			delete wvrmitConnection.sessionDescriptions[e.session.sessionid];
		}
		//console.log('After deleting[' + e.session.sessionid + '] wvrmitConnection.sessionDescriptions: ' + JSON.stringify(wvrmitConnection.sessionDescriptions));

		var roomItem = document.getElementById(e.session.sessionid);
		if (roomItem) roomItem.parentNode.parentNode.removeChild(roomItem.parentNode);
	};

	wvrmitConnection.connect();

	$('#setup-new-meeting').on('click', function() {
		var newMeetingName = $('#new-name').val() || 'Anonymous';

		/*if (wvrmitConnection.sessionDescriptions[newMeetingName]) {/// Warning: Doesn't work, since wvrmitConnection.sessionDescriptions[newMeetingName] would be true even if the session was actually deleted during onSessionClosed.
			alert(newMeetingName + " already there! Please just find it and join...");
			return;
		} else {
			window.open('#!/mit/' + newMeetingName, '_blank');
		}*/
		if (document.getElementById(newMeetingName)) {
			alert(newMeetingName + " already there! Please just find it and join...");
			return;
		} else {
			window.open('#!/mit/' + newMeetingName, '_blank');
		}
	});

	function addToContainer(container, item) {
		var itemBox = document.createElement('div');
        itemBox.setAttribute('class', 'box photo col2 masonry-brick');

        itemBox.appendChild(item);
	    container.append(itemBox);

	    $('#container').masonry('appended', itemBox);
	}

});
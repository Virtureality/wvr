$(function(){

	var roomsContainer = $('#meetingsContainer');
	var rooms = new Map();

	var wvrmitConnection = new RTCMultiConnection('wvrmit');

	wvrmitConnection.openSignalingChannel = function (config) {
		/*var SIGNALING_SERVER = 'https://webrtc-signaling.nodejitsu.com:443/',
		 defaultChannel = location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');*/
		var SIGNALING_SERVER = 'http://localhost:8888/',
		//var SIGNALING_SERVER = 'http://192.168.0.109:8888/',
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
	};

	wvrmitConnection.onNewSession = function (session) {

		//console.log('Room: ' + room.roomName + ' found!');

		if (rooms.has(session.sessionid)) {
			return;
		} else {
			//console.log('Adding room...');
			rooms.set(session.sessionid, session);

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

		if (rooms.has(e.session.sessionid)) {
			rooms.delete(e.session.sessionid);

			var roomItem = document.getElementById(e.session.sessionid);
			if (roomItem) roomItem.parentNode.parentNode.removeChild(roomItem.parentNode);
		}
	};

	wvrmitConnection.connect();

	$('#setup-new-meeting').on('click', function() {
		var newMeetingName = $('#new-name').val() || 'Anonymous';

		if (rooms.has(newMeetingName)) {
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
$(function(){

	var config = {
	    openSocket: function (config) {
	        /*var SIGNALING_SERVER = 'https://webrtc-signaling.nodejitsu.com:443/',
	            defaultChannel = location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');*/
	        //var SIGNALING_SERVER = 'http://localhost:8888/',
            var SIGNALING_SERVER = 'http://192.168.0.109:8888/',
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
	    onRoomFound: function (room) {

	    	//console.log('Room: ' + room.roomName + ' found!');

            if (rooms.has(room.roomName)) { 
            	return; 
            } else {
            	//console.log('Adding room...');
		        rooms.set(room.roomName, room);

            	var roomEntrance = document.createElement('a');
            	roomEntrance.setAttribute('id', room.roomName);
		    	roomEntrance.setAttribute('href', '#!/wvrmit/mit/' + room.roomName);
		    	roomEntrance.setAttribute('target', '_blank');
		    	roomEntrance.innerHTML = room.roomName;

		        addToContainer(roomsContainer, roomEntrance);
            }

	    },
	    onRoomClosed: function (room) {
	    	//console.log('Room: ' + room.roomToken + ' closed!');

	    	if (rooms.has(room.roomName)) {
	    		rooms.delete(room.roomName);

	    		var roomItem = document.getElementById(room.roomName);
	    		if (roomItem) roomItem.parentNode.parentNode.removeChild(roomItem.parentNode);
	    	}
	    }
	};

	var conferenceUI = conference(config);

	var roomsContainer = $('#meetingsContainer');
	var rooms = new Map();

	$('#setup-new-meeting').on('click', function() {
		var newMeetingName = $('#new-name').val() || 'Anonymous';

		if (rooms.has(newMeetingName)) {
			alert(newMeetingName + " already there! Please just find it and join...");
			return;
		} else {
			window.open('otmit/mit/' + newMeetingName, '_blank');
			//createNewMeeting(newMeetingName, callback);
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
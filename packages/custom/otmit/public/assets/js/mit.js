/**
 * New JS file
 */

var session;
var connectionCount = 0;

var container = $('#container');

//$(function(){
function startOT(apiKey, sessionId, token) {
  setButton($('#action-button').attr('onclick','').off(), 'Processing...', true);
  if(OT.checkSystemRequirements() == 0) {
	  console.log('The client does not support WebRTC!');

      setButton($('#action-button'), 'Oops! Your environment is not supported!', true);
  } else{
	session = OT.initSession(apiKey, sessionId);
	//var publisher = OT.initPublisher();
	
	session.on({
		connectionCreated: function(event) {
			connectionCount++;
			console.log(connectionCount + ' connections.');
		},
		connectionDestroyed: function(event) {
			connectionCount--;
			console.log(connectionCount + ' connections.');
		},
		sessionDisconnected: function(event) {
			session.off();
			connectionCount = 0;
			console.log(connectionCount + ' connections.');
			console.log('Disconnected from the session');
			setButton($('#action-button').off().on('click', function() {startOT(apiKey, sessionId, token);}), 'Reconnect', false);
			if(event.reason == 'networkDisconnected') {
				//alert('Your network connection terminated.');
				console.log('Your network connection terminated.');
			}
		},
		streamCreated: function(event) { 
			//session.subscribe(event.stream, 'subscribersDiv', {insertMode: 'append'});
			var videoBox = $('<div/>').attr('class', 'box photo col2 masonry-brick');
		    videoBox.appendTo(container);

			session.subscribe(event.stream, videoBox.get(0), {insertMode: 'append', audioVolume: 6, fitMode: 'contain', width: 168, height: 126});
			
			container.masonry('appended', videoBox);
			
		}
	});

	session.connect(token, function(error) {
		if (error) {
			console.log('Unable to connect:', error.message);
		} else {
			console.log('Connected.');
			//connectionCount = 1;
			setButton($('#action-button').off().on('click', function() {disconnect();}), 'Disconnect', false);
			//session.publish('myPublisherDiv', {width: 320, height: 240});
			var videoBox = $('<div/>').attr('class', 'box photo col2 masonry-brick');
		    videoBox.appendTo(container);
		    session.publish(videoBox.get(0), {insertMode: 'append', audioVolume: 6, fitMode: 'contain', width: 168, height: 126});
		    
		    container.masonry('appended', videoBox);
		    
			/*session.publish(publisher);*/
		}
	});
  }
}

function disconnect() {
	if(session) {
		setButton($('#action-button'), 'Disconnecting...', true);
		session.disconnect();
	}
}

function setButton(button, text, disable) {
	if(button) {
		if(text && text !== '') {
			button.text(text);
		}

	    button.attr('disabled', disable);
    }
}
//});
/**
 * New JS file
 */

var session;
var connectionCount = 0;

var container = $('#container');

//$(function(){
function startOT(apiKey, sessionId, token, username) {
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
			container.empty();
			container.masonry('reloadItems');
			/*var elements = container.masonry('getItemElements');
			container.masonry('remove', elements);*/
			console.log('Disconnected from the session');
			//$('#username').removeAttr('disabled');
			setButton($('#action-button').off().on('click', function() {startOT(apiKey, sessionId, token, username);}), 'Reconnect', false);
			if(event.reason == 'networkDisconnected') {
				//alert('Your network connection terminated.');
				console.log('Your network connection terminated.');
			}
		},
		streamCreated: function(event) { 
			//session.subscribe(event.stream, 'subscribersDiv', {insertMode: 'append'});
			var videoBox = $('<div/>').attr('class', 'box photo col2 masonry-brick').attr('id', event.stream.streamId);
		    videoBox.appendTo(container);

			session.subscribe(event.stream, videoBox.get(0), {insertMode: 'append', audioVolume: 6, fitMode: 'contain', width: 168, height: 126});
			
			container.masonry('appended', videoBox);
			
			console.log('Stream: ' + event.stream.streamId + ' started.');
		},
		streamDestroyed: function(event) {
			$('#' + event.stream.streamId).remove();
			console.log('Stream: ' + event.stream.streamId + ' stopped.');
		}
	});

	session.connect(token, function(error) {
		if (error) {
			//console.log('Unable to connect:', error.message);
			alert('Unable to connect:', error.message);
			//$('#username').removeAttr('disabled');
		} else {
			console.log('Connected.');
			//connectionCount = 1;
			$('#username').attr('disabled','disabled');
			setButton($('#action-button').off().on('click', function() {disconnect();}), 'Disconnect', false);
			//session.publish('myPublisherDiv', {width: 320, height: 240});
			if(session.capabilities.publish == 1) {
				var videoBox = $('<div/>').attr('class', 'box photo col2 masonry-brick').attr('id', 'publisherContainer');
			    videoBox.appendTo(container);
			    session.publish(videoBox.get(0), {name: username, insertMode: 'append', audioVolume: 6, fitMode: 'contain', width: 168, height: 126})
			    .on({
			    	streamCreated: function(event) {
						console.log('Publisher started streaming.');
					},
					streamDestroyed: function(event) {
						$('#publisherContainer').remove();
						console.log('Publisher stopped streaming.');
					}
			    });
			} else{
				console.log('You are not able to publish!');
			}
		    
		    container.masonry('appended', videoBox);
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
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
	var publisher, subscriber;
	
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
			var videoBox = $('<div/>').attr('class', 'box').attr('id', event.stream.streamId);
		    videoBox.appendTo(container);

		    subscriber = session.subscribe(event.stream, videoBox.get(0), {audioVolume: 6, insertMode: 'append', style: {nameDisplayMode: 'on'}});
		    
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
			
			if(session.capabilities.publish == 1) {
				var videoBox = $('<div/>').attr('class', 'box').attr('id', 'publisherContainer');
			    videoBox.appendTo(container);
			    
			    publisher = TB.initPublisher(apiKey, videoBox.get(0), {name: username, insertMode: 'append'});
			    
			    publisher.on({
			    	streamCreated: function(event) {
						console.log('Publisher started streaming.');
					},
					streamDestroyed: function(event) {
						$('#publisherContainer').remove();
						console.log('Publisher stopped streaming.');
					}
			    });			    

			    session.publish(publisher);
			    
			    //publisher.setStyle('nameDisplayMode', 'on');
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
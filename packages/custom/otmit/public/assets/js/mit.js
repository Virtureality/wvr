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
	
	var extensionId = 'bghjcghfgpfjcpojhgbdnjdnibedponh';
    OT.registerScreenSharingExtension('chrome', extensionId);
	
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
			console.log('Disconnected from the session');
			setButton($('#action-button').off().on('click', function() {startOT(apiKey, sessionId, token, username);}), 'Reconnect', false);
			if(event.reason == 'networkDisconnected') {
				alert('Your network connection terminated.');
				//console.log('Your network connection terminated.');
			}
		},
		streamCreated: function(event) {

		    if (event.stream.videoType === 'screen') {
				var screenContainer = $('#screen-share-area');
				screenContainer.masonry({
			        itemSelector : '.box'
			    });
						
				var screenBox = $('<div/>').attr('class', 'box').attr('id', event.stream.streamId);
				screenBox.appendTo($('#screen-main'));
				var subOptions = {
						insertMode: 'append',
						width: event.stream.videoDimensions.width / 2,
						height: event.stream.videoDimensions.height /2
				};
				session.subscribe(event.stream, screenBox.get(0), subOptions);
				screenContainer.masonry('appended', screenBox);
		    } else {
		    	var videoBox = $('<div/>').attr('class', 'box').attr('id', event.stream.streamId);
				videoBox.appendTo(container);
		    	subscriber = session.subscribe(event.stream, videoBox.get(0), {audioVolume: 6, insertMode: 'append', style: {nameDisplayMode: 'on'}});
				    
				container.masonry('appended', videoBox);
		    }
			
			console.log('Stream: ' + event.stream.streamId + ' started.');
		},
		streamDestroyed: function(event) {
			$('#' + event.stream.streamId).remove();
			console.log('Stream: ' + event.stream.streamId + ' stopped.');
		}
	});

	session.connect(token, function(error) {
		if (error) {
			alert('Unable to connect:', error.message);
		} else {
			console.log('Connected.');
			$('#username').attr('disabled','disabled');
			$('#shareBtn').removeAttr('disabled');
			
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
			} else{
				console.log('You are not able to publish!');
			}
		    
		    container.masonry('appended', videoBox);
		}
	});
  }
}

function screenshare() {
    OT.checkScreenSharingCapability(function(response) {
      if (!response.supported || response.extensionRegistered === false) {
        alert('This browser does not support screen sharing.');
      } else if (response.extensionInstalled === false) {
        alert('Please install the screen sharing extension and load this page over HTTPS.');
      } else {
        // Screen sharing is available. Publish the screen.
        // Create an element, but do not display it in the HTML DOM:
        var screenContainerElement = document.createElement('div');
        var screenName = $('#username').val() || 'Anonymous';
        screenName = 'Screen - ' + screenName;
        var screenSharingPublisher = OT.initPublisher(
          screenContainerElement,
          {name: screenName, videoSource : 'screen' },
          function(error) {
            if (error) {
              alert('Something went wrong: ' + error.message);
            } else {
              session.publish(
                screenSharingPublisher,
                function(error) {
                  if (error) {
                    alert('Something went wrong: ' + error.message);
                  }
                });
            }
          });
        }
      });
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
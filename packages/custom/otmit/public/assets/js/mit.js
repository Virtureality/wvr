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

		    if (event.stream.videoType === 'screen') {
				var screenContainer = $('#screen-share-area');
				screenContainer.masonry({
			        itemSelector : '.box'
			    });
				
				/*var screenLeftSide = $('<div/>').attr('class', 'box');
				screenLeftSide.appendTo($('#screen-main'));
				//screenContainer.masonry('appended', screenLeftSide);
*/				
				var screenBox = $('<div/>').attr('class', 'box').attr('id', event.stream.streamId);
				screenBox.appendTo($('#screen-main'));
				var subOptions = {
						insertMode: 'append',
						width: event.stream.videoDimensions.width / 2,
						height: event.stream.videoDimensions.height /2
				};
				session.subscribe(event.stream, screenBox.get(0), subOptions);
				screenContainer.masonry('appended', screenBox);
				
				/*var screenRightSide = $('<div/>').attr('class', 'box');
				screenRightSide.appendTo($('#screen-main'));
				//screenContainer.masonry('appended', screenRightSide);
				
				screenContainer.masonry('reloadItems');*/
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
			//console.log('Unable to connect:', error.message);
			alert('Unable to connect:', error.message);
			//$('#username').removeAttr('disabled');
		} else {
			console.log('Connected.');
			//connectionCount = 1;
			$('#username').attr('disabled','disabled');
			
			//prepareScreenShare();
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
			    
			    //publisher.setStyle('nameDisplayMode', 'on');
			} else{
				console.log('You are not able to publish!');
			}
		    
		    container.masonry('appended', videoBox);
		}
	});
  }
}

function prepareScreenShare() {
	OT.checkScreenSharingCapability(function(response) {
        if (!response.supported || response.extensionRegistered === false) {
          alert('This browser does not support screen sharing.');
        } else if (response.extensionInstalled === false) {
          alert('Please install the screen sharing extension and load this page over HTTPS.');
        } else {
        	$('#shareBtn').removeAttr('disabled');
        }
	});
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
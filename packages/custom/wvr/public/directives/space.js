angular.module('wvr.space').directive('wvrSpace', function() {
    return {
        priority: 10,
        link: function(scope, elm, attrs) {
            scope.$on('spaceReached', function() {
                var defaultChannel = 'wvrmit';

                var wvrmitConnection;
                var wvrmitScreenConnection;

                var detectingRoom = false;
                var roomDetected = false;
                var joinDisabled = false;
                var screenSharingDisabled = true;

                var actionArea = $('#action-area');
                var actionButton = $('#action-button');
                var container = $('#container');

                var mname = scope.space.uuid;

                var userID = getUserID();

                var seatTakenMsgInterval;

                startWatching();

                function startWatching() {

                    setButton(actionButton, 'Watching ...', true);

                    wvrmitConnection = new RTCMultiConnection(defaultChannel);

                    wvrmitConnection.userid = userID;

                    if(window.openSignalingChannel) {
                        wvrmitConnection.openSignalingChannel = window.openSignalingChannel;
                    } else if(window.customSignaling && window.customSignaling === 'firebase' && window.signalingServer) {
                        wvrmitConnection.firebase = window.signalingServer;
                    }

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

                        if(state.name == 'room-not-available') {
                            setButton(actionButton, state.reason, true);
                            wvrmitConnection.connect(mname);
                        }

                        if(state.name == 'room-available') {
                            if(!joinDisabled) {
                                enableRequestToJoin();
                            }
                        }

                        if(state.name == 'connected-with-initiator') {
                            //alert(state.reason);
                            setButton(actionButton, 'Conference Ongoing...', true);

                            displaySpace();
                        }

                        if(state.name == 'request-rejected') {
                            alert(state.reason);

                            joinDisabled = false;
                            if(!joinDisabled) {
                                enableRequestToJoin(true);
                            }
                        }

                        if(state.name == 'failed---has reason') {
                            alert(state.reason);
                        }
                    };

                    wvrmitConnection.onstream = function (e) {

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

                        if(e.isVideo) {

                            var userPresenceBox = $('<div/>').attr('class', 'box photo col2 masonry-brick').attr('data-space-type', 'freespace');
                            var userTxt = e.userid;
                            var index = userTxt.lastIndexOf('-');
                            var userName;
                            var streamUserID;
                            if(index !== -1) {
                                userName = userTxt.substr(0, index);
                                streamUserID = userTxt.substr(index + 1, userTxt.length);
                            } else {
                                userName = userTxt;
                                streamUserID = userTxt;
                            }
                            var video = $(e.mediaElement).attr('id', 'video-' + streamUserID).attr('controls', true).attr('height', '100%').attr('width', '100%');

                            /*if(e.type === 'local' && (!scope.space.owner || scope.loginUser._id === scope.space.owner._id)) {
                                displaySpace();
                            }*/

                            var videoSpan = $('<span/>');
                            var userSpan = $('<span/>').text(userName);
                            var newPElement;
                            video.appendTo(videoSpan);
                            newPElement = $('<p/>');
                            videoSpan.appendTo(newPElement);
                            userSpan.appendTo(newPElement);
                            newPElement.appendTo(userPresenceBox);
                            userPresenceBox.appendTo(container);

                            container.masonry('appended', userPresenceBox);
                        }

                    };

                    wvrmitConnection.onstreamended = function (e) {
                        var userTxt = e.userid;
                        var streamUserID = userTxt;
                        var index = userTxt.lastIndexOf('-');
                        if(index !== -1) {
                            streamUserID = userTxt.substr(index + 1, userTxt.length);
                        }

                        var userVideo = $('#video-' + streamUserID);
                        if(userVideo) {
                            var userVideoBox = userVideo.parent().parent().parent();
                            var userVideoBoxType = userVideoBox.attr('data-space-type');
                            if(userVideoBoxType === 'freespace') {
                                userVideoBox.remove();
                            } else if(userVideoBoxType === 'seat') {
                                var seatTakeElement = $('<button/>').attr('class', 'btn btn-success badge').text('Take the Seat');
                                seatTakeElement.bind('click', takeSeatHandler);
                                var userVideoPElement = userVideo.parent().parent();
                                userVideoPElement.children().remove();
                                userVideoPElement.append(seatTakeElement);
                            }
                        }
                    };

                    //wvrmitConnection.transmitRoomOnce = true;
                    wvrmitConnection.onNewSession = function (session) {

                        // session.userid
                        // session.sessionid
                        // session.extra
                        // session.session i.e. {audio,video,screen,data}

                        detectingRoom = true;
                        setButton(actionButton, 'Checking ...', true);

                        if (session.sessionid == mname) {
                            roomDetected = true;

                            if(!joinDisabled) {
                                enableRequestToJoin();
                            }
                        }

                        detectingRoom = false;

                    };

                    var messageArea = $('#message-area');

                    var sendMsgButton = $('#send-msg-btn');

                    sendMsgButton.on('click', function() {
                        var msgBody = $('#message-text').val() || '';
                        if (msgBody && msgBody !== '') {
                            wvrmitConnection.send(msgBody);
                            messageArea.append($('<div>').append('Me: ' + msgBody));
                        } else{
                            alert('Please input message content correctly!');
                        }
                    });

                    wvrmitConnection.onopen = function(e) {
                        // e.userid
                        // e.extra

                        setButton(sendMsgButton, 'Send', false);

                        if(screenSharingDisabled) {
                            enableScreenSharing();
                        }
                    };

                    wvrmitConnection.onmessage = function(e) {
                        // e.data     ---- translated text
                        // e.original ---- original text
                        // e.userid
                        // e.extra

                        var userName = e.userid;
                        if(userName.lastIndexOf('-') !== -1) {
                            userName = userName.substr(0, userName.lastIndexOf('-'));
                        }

                        messageArea.append($('<div>').append(userName + ': ' + e.data));
                    };

                    wvrmitConnection.onCustomMessage = function(msg) {
                        if(msg.msgType == 'SeatTaken') {
                            takeSeat(msg.seatID, msg.takerID);
                        }
                    };

                    //wvrmitConnection.fakeDataChannels = true;

                    wvrmitConnection.connect();

                    enableShare(mname);

                    setTimeout(checkForSetup, 3000);

                }

                function getUserID() {
                    var result = (Math.round(Math.random() * 999999999) + 999999999).toString();

                    var loginUser = scope.loginUser;

                    if (loginUser && loginUser._id && loginUser._id !== '') {
                        result = loginUser.name + '-' + loginUser._id;
                    }

                    return result;
                }

                function checkForSetup() {

                    if (scope.ableToOpenDefaultRoom && !detectingRoom &&!roomDetected) {
                        setup();
                    }

                }

                function setup() {

                    setButton(actionButton, 'Activate', false);

                    actionButton.bind('click', doSetup);

                    function doSetup() {

                        actionButton.unbind('click', doSetup);

                        setButton(actionButton, 'Setting up ...', true);

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

                        displaySpace();

                        setButton(actionButton, 'Conference Ongoing...', true);

                    }

                }

                function enableRequestToJoin(retry) {

                    if(retry) {
                        wvrmitConnection.dontCaptureUserMedia = true;
                    }

                    setButton(actionButton, 'Request to Access', false);

                    actionButton.bind('click', requestToJoinHandler);

                    function requestToJoinHandler() {

                        joinDisabled = true;
                        actionButton.unbind('click', requestToJoinHandler);

                        wvrmitConnection.join(mname);
                        setButton(actionButton, 'Requesting to Access ...', true);

                    }
                }

                function enableShare(mname){
                    var shareLink = $('<a/>').attr('class', 'pull-left').attr('target', '_blank').attr('href', location.href).text('Share: ' + mname);
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

                function displaySpace() {

                    scope.$apply(function() {
                        scope.showSpace();

                        var space = scope.space;
                        var seats;
                        var seat;
                        var seatElement;

                        if(space) {
                            if(space.owner && space.owner._id) {

                                seatElement = $('#' + space.owner._id);
                                if(seatElement.length == 1) {
                                    var seatTakeElement = $('<button/>').attr('class', 'btn btn-success badge').text('Take the Seat');
                                    seatTakeElement.bind('click', takeSeatHandler);
                                    seatElement.children().remove();
                                    seatTakeElement.appendTo(seatElement);
                                }
                            }
                            if(space.facilities) {
                                seats = space.facilities;

                                for(var i = 0; i < seats.length; i++) {
                                    seat = seats[i];

                                    seatElement = $('#' + seat._id);
                                    if(seatElement.length == 1) {
                                        var seatTakeElement = $('<button/>').attr('class', 'btn btn-success badge').text('Take the Seat');
                                        seatTakeElement.bind('click', takeSeatHandler);
                                        seatTakeElement.appendTo(seatElement);
                                    }
                                }
                            }

                            enableScreen();
                        }

                    });

                    container.masonry();

                }

                function enableScreen() {

                    wvrmitScreenConnection = new RTCMultiConnection(defaultChannel + '-screen');
                    wvrmitScreenConnection.userid = userID;

                    if(window.openSignalingChannel) {
                        wvrmitScreenConnection.openSignalingChannel = window.openSignalingChannel;
                    } else if(window.customSignaling && window.customSignaling === 'firebase' && window.signalingServer) {
                        wvrmitScreenConnection.firebase = window.signalingServer;
                    }

                    wvrmitScreenConnection.onstream = function(e) {
                        if(e.isScreen) {
                            var screenDisplayElement = $('#screenDisplay');
                            var screenMediaElement = $(e.mediaElement).attr('height', '96%').attr('width', '96%').attr('autoplay', 'true');
                            screenMediaElement.appendTo(screenDisplayElement);
                            //rotateVideo(e.mediaElement);

                            if(e.type === 'local') {
                                scope.screenAction = function() {
                                    setButton($('#screenActionButton'), 'Processing...', true);
                                    var peers = Object.keys(wvrmitScreenConnection.peers);
                                    for(var i = 0; i < peers.length; i++) {
                                        wvrmitScreenConnection.remove(peers[i]);
                                    }
                                    wvrmitScreenConnection.close();
                                    setTimeout(enableScreenSharing, 1000);
                                };
                                setButton($('#screenActionButton'), 'You are sharing screen ... Click to Close!', false);
                            } else {
                                if(e.mediaElement.play) {
                                    e.mediaElement.play();
                                }
                                setButton($('#screenActionButton'), e.userid + ' is sharing screen ...', true);
                            }
                        }
                    };

                    wvrmitScreenConnection.onstreamended = function(e) {
                        if(e.isScreen && e.type === 'local') {
                            //e.mediaElement.style.opacity = 0;
                            //rotateVideo(e.mediaElement);
                            setTimeout(function() {
                                if (e.mediaElement.parentNode) {
                                    e.mediaElement.parentNode.removeChild(e.mediaElement);
                                }
                            }, 1000);
                        }
                    };

                    wvrmitScreenConnection.onSessionClosed = function(e) {
                        $('#screenDisplay').children().remove();
                        setTimeout(enableScreenSharing, 1000);
                    };

                    wvrmitScreenConnection.onNewSession = function(session) {

                        if(session.sessionid == mname + '-screen') {
                            session.join();
                        }
                    };

                    scope.showScreen = true;
                    scope.screenOpen = false;
                    scope.toggleScreen = function() {
                        scope.screenOpen = !scope.screenOpen;
                    };

                    wvrmitScreenConnection.connect();

                    //window.onresize = scaleVideos;
                }

                function enableScreenSharing() {

                    wvrmitScreenConnection.refresh();

                    setTimeout(function() {
                        wvrmitScreenConnection.sdpConstraints.mandatory = {
                            OfferToReceiveAudio: false,
                            OfferToReceiveVideo: true
                        };

                        wvrmitScreenConnection.session = {
                            screen: true,
                            oneway: true
                        };

                        scope.screenAction = startSharing;
                        setButton($('#screenActionButton'), 'Share Screen', false);
                        screenSharingDisabled = true;
                    }, 3000);

                }

                function startSharing() {
                    setButton($('#screenActionButton'), 'Processing...', true);

                    wvrmitScreenConnection.isInitiator = true;
                    // screen sender don't need to receive any media.
                    // so both media-lines must be "sendonly".
                    wvrmitScreenConnection.sdpConstraints.mandatory = {
                        OfferToReceiveAudio: false,
                        OfferToReceiveVideo: false
                    };
                    wvrmitScreenConnection.open(mname + '-screen');
                }

                function rotateVideo(mediaElement) {
                    mediaElement.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(0deg)';
                    setTimeout(function() {
                        mediaElement.style[navigator.mozGetUserMedia ? 'transform' : '-webkit-transform'] = 'rotate(360deg)';
                    }, 1000);
                }

                function scaleVideos() {
                    var videos = document.querySelectorAll('video'),
                        length = videos.length,
                        video;
                    var minus = 130;
                    var windowHeight = 700;
                    var windowWidth = 600;
                    var windowAspectRatio = windowWidth / windowHeight;
                    var videoAspectRatio = 4 / 3;
                    var blockAspectRatio;
                    var tempVideoWidth = 0;
                    var maxVideoWidth = 0;
                    for (var i = length; i > 0; i--) {
                        blockAspectRatio = i * videoAspectRatio / Math.ceil(length / i);
                        if (blockAspectRatio <= windowAspectRatio) {
                            tempVideoWidth = videoAspectRatio * windowHeight / Math.ceil(length / i);
                        } else {
                            tempVideoWidth = windowWidth / i;
                        }
                        if (tempVideoWidth > maxVideoWidth)
                            maxVideoWidth = tempVideoWidth;
                    }
                    for (var i = 0; i < length; i++) {
                        video = videos[i];
                        if (video)
                            video.width = maxVideoWidth - minus;
                    }
                }

                function takeSeatHandler() {

                    var seatTakeElement = $(this);
                    var desSeatElement = seatTakeElement.parent();
                    var desSeatID = desSeatElement.attr('id');

                    var seatTakerID = userID;
                    var index = userID.lastIndexOf('-');
                    if(index !== -1) {
                        seatTakerID = userID.substr(index + 1, userID.length);
                    }

                    takeSeat(desSeatID, seatTakerID);

                    if(seatTakenMsgInterval) {
                        clearInterval(seatTakenMsgInterval);
                    }
                    seatTakenMsgInterval = setInterval(function() {
                        wvrmitConnection.sendCustomMessage({msgType: 'SeatTaken', seatID: desSeatID, takerID: seatTakerID});
                    }, 1000);
                }

                function takeSeat(seatID, takerID) {

                    if(seatID && takerID) {
                        var desSeatElement = $('#' + seatID);
                        var userVideoElement = $('#' + 'video-' + takerID);
                        var userPElement = userVideoElement.parent().parent();
                        var userDivElement = userPElement.parent();
                        var spaceType = userDivElement.attr('data-space-type');

                        if(userPElement.attr('id') !== seatID) {//Only taking action if the taker is not on the requested seat.

                            if(desSeatElement.length == 1 && userVideoElement.length == 1) {

                                desSeatElement.children().remove();
                                userPElement.children().appendTo(desSeatElement);

                                if(spaceType && spaceType == 'seat') {
                                    var seatTakeElement = $('<button/>').attr('class', 'btn btn-success badge').text('Take the Seat');
                                    seatTakeElement.bind('click', takeSeatHandler);
                                    userPElement.children().remove();
                                    seatTakeElement.appendTo(userPElement);
                                } else if(spaceType == 'freespace' && userDivElement) {
                                    userDivElement.remove();
                                }

                                container.masonry();
                            }

                        }
                    }
                }

            });
        }
    }
});

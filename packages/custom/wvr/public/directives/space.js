angular.module('wvr.space').directive('wvrSpace', ['$timeout', '$http', function($timeout, $http) {
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

                var userID = scope.currentUserID || getUserID();
                scope.currentUserID = userID;

                var seatTakenMsgInterval;

                var messageArea = $('#message-area');

                var sendMsgButton = $('#send-msg-btn');

                var isEnablingRequestToJoin = false;

                var selfStreamID;

                var roomFixed = false;

                var currentSessionToJoin;

                activateRTCRoom();

                function activateRTCRoom() {

                    //setButton(actionButton, 'Activating RTC ...', true, true);
                    setButton(actionButton, 'Marching...', true);

                    wvrmitConnection = new RTCMultiConnection(defaultChannel);
                    scope.webrtcRoom = mname;
                    scope.webrtcConnection = wvrmitConnection;

                    wvrmitConnection.userid = userID;

                    setTimeout(checkForReset, 60000);

                    function checkForReset() {
                        var styleString = actionButton.attr('style');
                        if(!styleString || styleString.indexOf('display:none') === -1) {
                            setButton(actionButton, 'Fix', false);

                            actionButton.unbind();
                            actionButton.bind('click', fixRTCRoom);

                            function fixRTCRoom() {
                                actionButton.unbind();

                                wvrmitConnection.sendCustomMessage({
                                    msgType: 'fixRTCRoom',
                                    roomId: mname
                                });

                                setButton(actionButton, 'Fixing...', true);

                                setTimeout(function() {
                                    if(!roomFixed) {
                                        setButton(actionButton, 'Failed to Fix', true);
                                    }
                                }, 60000);
                            }
                        }
                    }

                    wvrmitConnection.autoCloseEntireSession = false;

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

                        if(state.name == 'detecting-room-presence') {
                            setButton(actionButton, state.reason, true, true);
                        }

                        if(state.name == 'room-available') {
                            setButton(actionButton, 'Accessing ...', true, true);
                        }

                        if(state.name == 'room-not-available') {
                            setButton(actionButton, state.reason, true);
                        }

                        if(state.name == 'connected-with-initiator') {
                            setButton(actionButton, 'You Are In', true, true);

                            displaySpace();
                        }

                        if(state.name == 'request-accepted') {
                            var useKeyBtn = $('#askForKeyActionBtn');
                            if(useKeyBtn.size() === 1) {
                                setButton(useKeyBtn, 'You Are In', true, true);
                            }
                        }

                        if(state.name == 'request-rejected') {
                            setButton(actionButton, state.reason, true);

                            joinDisabled = false;
                            if(!joinDisabled) {
                                enableRequestToJoin(true);
                                //enableRequestToJoin(wvrmitConnection.session, true);
                            }
                        }

                        if(state.name == 'failed---has reason') {
                            setButton(actionButton, state.reason, true);
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

                        /*console.log('onstream: ');
                        console.log('e.streamid: ' + e.streamid);
                        console.log('e.session: ' + e.session);
                        console.log('e.blobURL: ' + e.blobURL);
                        console.log('e.type: ' + e.type);
                        console.log('e.userid: ' + e.userid);
                        console.log('e.isVideo: ' + e.isVideo);
                        console.log('e.isAudio: ' + e.isAudio);
                        console.log('e.isScreen: ' + e.isScreen);*/

                        if(e.type === 'local' && e.streamid) {
                            selfStreamID = e.streamid;
                        }

                        if(e.isVideo) {
                            addUser(e);
                        }

                    };

                    wvrmitConnection.onstreamended = function (e) {

                        /*console.log('onstreamended: ');
                        console.log('e.streamid: ' + e.streamid);
                        console.log('e.session: ' + e.session);
                        console.log('e.blobURL: ' + e.blobURL);
                        console.log('e.type: ' + e.type);
                        console.log('e.userid: ' + e.userid);
                        console.log('e.isVideo: ' + e.isVideo);
                        console.log('e.isAudio: ' + e.isAudio);
                        console.log('e.isScreen: ' + e.isScreen);*/

                        var userTxt = e.userid;
                        var streamUserID = userTxt;
                        var index = userTxt.lastIndexOf('-');
                        if(index !== -1) {
                            streamUserID = userTxt.substr(index + 1, userTxt.length);
                        }

                        //var userVideo = $('#video-' + streamUserID);
                        //wvrmitConnection.removeStream(e.streamid);
                        //wvrmitConnection.remove(e.userid);
                        var userVideo = $('#' + e.streamid);
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

                        scope.$apply(function() {
                            scope.imers.delete(e.userid);
                            scope.imerList = Array.from(scope.imers);
                        });
                    };

                    //wvrmitConnection.transmitRoomOnce = true;
                    /*wvrmitConnection.onNewSession = function (session) {

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

                    };*/
                    wvrmitConnection.onNewSession = function (session) {
                        //console.log('wvrmitConnection.onNewSession: ' + JSON.stringify(session));

                        // session.userid
                        // session.sessionid
                        // session.extra
                        // session.session i.e. {audio,video,screen,data}

                        setButton(actionButton, 'Accessing ...', true, true);

                        if (session.sessionid == mname) {

                            //console.log('onNewSession: ' + JSON.stringify(session));

                            currentSessionToJoin = session;

                            if(!wvrmitConnection.isInitiator && wvrmitConnection.sessionid) {
                                wvrmitConnection.dontCaptureUserMedia = true;
                            }

                            if(session.session.status && session.session.status.locked) {
                                var askForKeyActionBtn = $('<button/>').attr('id', 'askForKeyActionBtn').attr('class', 'btn btnIptSmOR badge').text('Open');

                                askForKeyActionBtn.bind('click', askForKey);

                                askForKeyActionBtn.appendTo(actionArea);

                                if(!isEnablingRequestToJoin && !joinDisabled) {
                                    //enableRequestToJoin(session);
                                    enableRequestToJoin(false, session);
                                }
                            } else {
                                wvrmitConnection.join(session);
                            }
                        }

                    };

                    sendMsgButton.on('click', function() {
                        var msgBody = $('#message-text').val() || '';
                        if (msgBody && msgBody !== '') {
                            var targets = scope.imers;

                            if (targets.size > 0) {
                                /*console.log('Broadcasting to wvrmitConnection.peers: ' + Object.keys(wvrmitConnection.peers));
                                targets.forEach(function(value1, value2, set) {
                                    console.log('Sending message: ' + msgBody + ' to: ' + value1);
                                    wvrmitConnection.peers[value1].sendCustomMessage({msgType: 'IM', sender: wvrmitConnection.userid, message: msgBody});
                                });*/
                                targets.forEach(function(value1, value2, set) {
                                    wvrmitConnection.sendCustomMessage({msgType: 'IM', sender: wvrmitConnection.userid, receiver: value1, message: msgBody});
                                });
                            } else {
                                wvrmitConnection.send(msgBody);
                            }
                            messageArea.append($('<div>').append('Me: ' + msgBody));
                        } else{
                            alert('Please input message content correctly!');
                        }
                    });

                    wvrmitConnection.onopen = function(e) {
                        // e.userid
                        // e.extra

                        /*if(!wvrmitConnection.peers[e.userid].onCustomMessageUpdated) {
                            console.log('Setting onCustomMessage handler between me[' + wvrmitConnection.userid + '] and ' + e.userid);
                            wvrmitConnection.peers[e.userid].onCustomMessageUpdated = true;
                            wvrmitConnection.peers[e.userid].onCustomMessage = function(msg) {
                                console.log('I[' + wvrmitConnection.userid + '] received message from ' + this.userid);
                                if(msg.msgType == 'IM') {
                                    messageArea.append($('<div>').append(msg.sender + ': ' + msg.message));
                                }
                            };
                            console.log('After setting, wvrmitConnection.peers: ' + Object.keys(wvrmitConnection.peers));
                        }*/

                        //setButton(sendMsgButton, 'Send', false);

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

                        //console.log('onCustomMessage: ' + JSON.stringify(msg));

                        if(msg.msgType == 'SeatTaken') {
                            takeSeat(msg.seatID, msg.takerID);
                        }

                        if(msg.msgType == 'IM' && msg.receiver == wvrmitConnection.userid) {
                            messageArea.append($('<div>').append(msg.sender + ': ' + msg.message));
                        }

                        if(msg.msgType === 'initiateRoom' && msg.roomId === mname && msg.initiator === wvrmitConnection.userid) {
                            setButton(actionButton, 'Accessing ...', true, true);

                            if(!wvrmitConnection.isInitiator) {
                                wvrmitConnection.isInitiator = true;

                                if(scope.space.locker) {
                                    var askForKeyActionBtn = $('<button/>').attr('id', 'askForKeyActionBtn').attr('class', 'btn btnIptSmOR badge').text('Open');

                                    askForKeyActionBtn.bind('click', askForKey);

                                    askForKeyActionBtn.appendTo(actionArea);
                                } else {
                                    initiateRoom(mname);
                                }

                                //initiateRoom(mname);
                            }
                        }

                        if(msg.msgType === 'rtcRoomFixed' && msg.roomId === mname && msg.requester === wvrmitConnection.userid) {
                            roomFixed = true;
                            setButton(actionButton, 'Fixed', true, true);
                            //activateRTCRoom();
                            window.location.reload(true);
                        }

                        if(msg.msgType === 'RoomStatusChange' && msg.roomId === mname) {
                            if(scope.space.locker) {

                                var lockBtn = $('#roomLocker');

                                if(lockBtn.size() === 0) {
                                    lockBtn = $('<button/>').attr('id', 'roomLocker').attr('class', 'btn btnIptSmOR badge');
                                    lockBtn.bind('click', lockHandler);
                                    lockBtn.appendTo(actionArea);
                                }

                                if(msg.status === 'locked') {
                                    scope.space.locked = true;
                                    lockBtn.text('UnLock');
                                } else if(msg.status === 'unlocked') {
                                    scope.space.locked = false;
                                    lockBtn.text('Lock');
                                }
                            }
                        }

                    };

                    //wvrmitConnection.fakeDataChannels = true;

                    wvrmitConnection.connect();

                    //enableShare(mname);

                    //setTimeout(checkForSetup, 3000);

                }


                function askForKey() {
                    //Ask for key
                    var key = prompt('Insert Your Key: ');
                    if(key != null && key != '') {
                        processKey(key);
                    }
                }

                function processKey(key) {

                    $http
                        .post('/api/proxy/wvr/space/key', {
                            spaceId: mname,
                            key: key
                        })
                        .success(function(response) {
                            if(response.pass) {
                                if(wvrmitConnection.isInitiator) {
                                    $timeout(function() {
                                        initiateRoom(mname);
                                    }, 1, false);
                                } else {
                                    wvrmitConnection.join(currentSessionToJoin);
                                }

                                var askForKeyActionBtn = $('#askForKeyActionBtn');
                                if(askForKeyActionBtn) {
                                    setButton(askForKeyActionBtn, 'Open', true, true);
                                }
                            } else {
                                key = prompt('Wrong Key! Insert Correct Key: ');

                                if(key != null && key != '') {
                                    processKey(key);
                                }
                            }
                        })
                        .error(function(response) {
                            alert('Oops! We got some trouble at the moment, please try again later. :-');
                        });
                }

                function initiateRoom(roomId) {
                    //setButton(actionButton, 'Setting up ...', true, true);

                    /*if(rejoin) {
                        wvrmitConnection.dontCaptureUserMedia = true;
                    }*/

                    wvrmitConnection.isInitiator = true;

                    if(scope.space.locker && wvrmitConnection.session.status && wvrmitConnection.session.status.locked) {
                        wvrmitConnection.onRequest = onRequestHandler;
                    }
                    wvrmitConnection.session = {
                        audio: true,
                        video: true,
                        data:  true
                    };
                    wvrmitConnection.maxParticipantsAllowed = 256;
                    wvrmitConnection.open(roomId);

                    displaySpace();

                    setButton(actionButton, 'You Are In', true, true);
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

                    if (scope.ableToOpenDefaultRoom && !detectingRoom && !roomDetected) {
                        setup();
                    }

                }

                function setup() {

                    setButton(actionButton, 'Unlock', false);

                    actionButton.unbind();
                    actionButton.bind('click', doSetup);

                    function doSetup() {

                        actionButton.unbind('click', doSetup);

                        setButton(actionButton, 'Setting up ...', true, true);

                        wvrmitConnection.isInitiator = true;
                        /*wvrmitConnection.onRequest = function(request) {
                            var acceptDecision = confirm(request.userid + ' is requesting to join, would you accept?');

                            wvrmitConnection.dontCaptureUserMedia = true;
                            if(acceptDecision) {
                                wvrmitConnection.accept(request);
                            } else {
                                wvrmitConnection.reject(request);
                            }
                        };*/
                        wvrmitConnection.onRequest = onRequestHandler;

                        wvrmitConnection.session = {
                            audio: true,
                            video: true,
                            data:  true
                        };
                        wvrmitConnection.maxParticipantsAllowed = 256;
                        wvrmitConnection.open(mname);

                        displaySpace();

                        setButton(actionButton, 'You Are In', true, true);

                    }

                }

                function enableRequestToJoin(retry, session) {

                    isEnablingRequestToJoin = true;

                    if(retry) {
                        wvrmitConnection.dontCaptureUserMedia = true;
                    }

                    setButton(actionButton, 'Knock', false);

                    actionButton.unbind();
                    actionButton.bind('click', requestToJoinHandler);

                    function requestToJoinHandler() {
                        joinDisabled = true;
                        actionButton.unbind('click', requestToJoinHandler);

                        //wvrmitConnection.join(mname);
                        if(session) {
                            wvrmitConnection.session.actionType = 'Knock';
                            console.log('requestToJoinHandler session: ' + JSON.stringify(wvrmitConnection.session));
                            wvrmitConnection.join(session);
                        } else {
                            wvrmitConnection.join(mname);
                        }
                        setButton(actionButton, 'Requesting to Enter ...', true);

                        isEnablingRequestToJoin = false;

                    }
                }

                function enableShare(mname){
                    var shareLink = $('<a/>').attr('class', 'pull-left').attr('target', '_blank').attr('href', location.href).text('Share: ' + mname);
                    shareLink.appendTo(actionArea);
                }

                function setButton(button, text, disable, hide) {
                    if(button) {
                        if(text && text !== '') {
                            button.text(text);
                        }

                        button.attr('disabled', disable);
                        if(hide){
                            button.attr('style', 'display:none');
                        } else{
                            button.attr('style', 'display:');
                        }
                    }
                }

                function addUser(e) {
                    var userPresenceBox = $('<div/>').attr('class', 'box-masonry photo col2 masonry-brick').attr('data-space-type', 'freespace');
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
                    //var video = $(e.mediaElement).attr('id', 'video-' + streamUserID).attr('controls', true).attr('autoplay', true).attr('height', '180px').attr('width', '230px');
                    var video = $(e.mediaElement).attr('controls', true).attr('autoplay', true).attr('height', '180px').attr('width', '230px');

                    var videoSpan = $('<span/>');
                    var userSpan = $('<span/>').text(userName);
                    var newPElement;
                    video.appendTo(videoSpan);
                    newPElement = $('<p/>');
                    videoSpan.appendTo(newPElement);
                    var userPElement = $('<p/>');
                    userPElement.appendTo(newPElement);
                    userSpan.appendTo(userPElement);
                    if(e.userid !== userID) {
                        var imSwitch = $('<button/>').attr('id', e.userid + '-im').attr('class', 'btn btn-info').attr('style', 'margin-left: 6px;').attr('title', 'Click to Add for Messaging').text('IM Off').appendTo(userPElement);

                        imSwitch.bind('click', {targetIMer: e.userid}, function(event) {
                            var imSwitchBtn = $(this);
                            var status = imSwitchBtn.text();
                            /*var imer = imSwitchBtn.attr('id');

                            var index = imer.indexOf('-im');
                            if(index !== -1) {
                                imer = imer.substr(0, index);
                            }*/
                            var imer = event.data.targetIMer;

                            if(status === 'IM Off') {
                                scope.$apply(function() {
                                    scope.imers.add(imer);
                                    scope.imerList = Array.from(scope.imers);
                                });
                                imSwitchBtn.attr('title', 'Click to Remove from Messaging').text('IM On');
                            } else if('IM On') {
                                scope.$apply(function() {
                                    scope.imers.delete(imer);
                                    scope.imerList = Array.from(scope.imers);
                                });
                                imSwitchBtn.attr('title', 'Click to Add for Messaging').text('IM Off');
                            }
                        });
                    }
                    newPElement.appendTo(userPresenceBox);
                    userPresenceBox.appendTo(container);

                    container.masonry('appended', userPresenceBox);

                    var videoDOMObj = video.get(0);

                    setTimeout(playVideo, 1000);


                    /*setTimeout(function() {
                        wvrmitConnection.peers[e.userid].takeSnapshot(function(snapshot) {
                            videoDOMObj.poster = snapshot;
                        });
                    }, 3000);*/

                    if(e.type === 'remote') {
                        setTimeout(pauseVideo, 6000);
                    }
                    //setTimeout(pauseVideo, 6000);

                    function playVideo() {
                        videoDOMObj.play();
                    }

                    function pauseVideo() {
                        videoDOMObj.pause();
                        /*setTimeout(function() {
                            videoDOMObj.poster = 'http://localhost:3000/wvr/assets/img/lily.jpeg';
                        }, 1000);*/
                    }
                }

                function lockHandler() {
                    var roomStatus;
                    scope.space.locked = !scope.space.locked;

                    if(scope.space.locked) {
                        roomStatus = 'locked';
                        $(this).text('Unlock');
                    } else {
                        roomStatus = 'unlocked';
                        $(this).text('Lock');
                    }

                    if(wvrmitConnection.isInitiator) {
                        if(!wvrmitConnection.session.status) {
                            wvrmitConnection.session.status = {};
                        }
                        wvrmitConnection.session.status.locked = true;

                        if(scope.space.locker) {
                            wvrmitConnection.onRequest = onRequestHandler;
                        }
                    }

                    wvrmitConnection.sendCustomMessage({msgType: 'RoomStatusChange', roomId: mname, status: roomStatus});
                }

                function onRequestHandler(request) {
                    wvrmitConnection.dontCaptureUserMedia = true;
                    if(request.session && request.session.actionType == 'Knock') {
                        var acceptDecision = confirm(request.userid + ' is knocking, would you respond?');
                        if(acceptDecision) {
                            wvrmitConnection.accept(request);
                        } else {
                            wvrmitConnection.reject(request);
                        }
                    } else {
                        wvrmitConnection.accept(request);
                    }
                }

                function displaySpace() {

                    scope.$apply(function() {
                        scope.showSpace();

                        var space = scope.space;
                        var seats;
                        var seat;
                        var seatElement;

                        setButton(sendMsgButton, 'Send', false);

                        if(space) {

                            if(!space.owner) {
                                var ownActionBtn = $('<button/>').attr('class', 'btn btnIptSmOR badge').text('Own');

                                ownActionBtn.bind('click', scope.ownSpace);

                                ownActionBtn.appendTo(actionArea);
                            } else {
                                var lockerManagerBtn = $('#lockerManagerBtn');
                                if(lockerManagerBtn && lockerManagerBtn.size() < 1) {
                                    lockerManagerBtn = $('<button/>').attr('id', 'lockerManagerBtn');
                                }
                                if(space.locker) {
                                    var lockBtnText;
                                    space.locked = false;
                                    lockBtnText = 'Lock';

                                    var lockBtn = $('<button/>').attr('id', 'roomLocker').attr('class', 'btn btnIptSmOR badge').text(lockBtnText);
                                    lockBtn.bind('click', lockHandler);
                                    lockBtn.appendTo(actionArea);

                                    if(scope.loginUser && scope.space.owner && (scope.loginUser._id === scope.space.owner._id)) {
                                        lockerManagerBtn.unbind();

                                        lockerManagerBtn.attr('class', 'btn btnIptSmOR badge').text('Change Locker');

                                        lockerManagerBtn.bind('click', scope.changeLocker);

                                        lockerManagerBtn.appendTo(actionArea);
                                    }
                                } else if(scope.loginUser && scope.space.owner && (scope.loginUser._id === scope.space.owner._id)) {
                                    lockerManagerBtn.unbind();

                                    lockerManagerBtn.attr('class', 'btn btnIptSmOR badge').text('Add Locker');

                                    lockerManagerBtn.bind('click', scope.addLocker);

                                    lockerManagerBtn.appendTo(actionArea);
                                }
                            }

                            /*if(space.owner && space.owner._id) {

                                seatElement = $('#' + space.owner._id);
                                if(seatElement.length == 1) {
                                    var seatTakeElement = $('<button/>').attr('class', 'btn btn-success badge').text('Take the Seat');
                                    seatTakeElement.bind('click', takeSeatHandler);
                                    seatElement.children().remove();
                                    seatTakeElement.appendTo(seatElement);
                                }
                            }*/

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
                        if(scope.screenOpen && !scope.screenExtensionReminded) {
                            scope.operationInfo = 'Remind: Screen needs extension: ';
                            var operationInfoElem = $('#operationInfoElem');
                            $('<a>').attr('class', 'btn btn-info badge').attr('target', '_blank').attr('href', 'https://chrome.google.com/webstore/detail/screen-capturing/ajhifddimkapgcifgcodmmfdlknahffk').text('Chrome').appendTo(operationInfoElem);
                            $('<a>').attr('class', 'btn btn-info badge').attr('target', '_blank').attr('href', 'https://addons.mozilla.org/en-US/firefox/addon/enable-screen-capturing/').text('Firefox').appendTo(operationInfoElem);
                            scope.alertStyle = 'alert-info';
                            scope.screenExtensionReminded = true;
                        }
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
                    //wvrmitScreenConnection.autoCloseEntireSession = false;
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

                    /*var seatTakerID = userID;
                    var index = userID.lastIndexOf('-');
                    if(index !== -1) {
                        seatTakerID = userID.substr(index + 1, userID.length);
                    }

                    takeSeat(desSeatID, seatTakerID);*/
                    var seatTakerID = selfStreamID;

                    takeSeat(desSeatID);

                    if(seatTakenMsgInterval) {
                        clearInterval(seatTakenMsgInterval);
                    }
                    seatTakenMsgInterval = setInterval(function() {
                        wvrmitConnection.sendCustomMessage({msgType: 'SeatTaken', seatID: desSeatID, takerID: seatTakerID});
                    }, 1000);
                }

                function takeSeat(seatID, takerID) {

                    takerID = takerID || selfStreamID;

                    if(seatID && takerID) {
                        var desSeatElement = $('#' + seatID);
                        //var userVideoElement = $('#' + 'video-' + takerID);
                        var userVideoElement = $('#' + takerID);
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
}]);

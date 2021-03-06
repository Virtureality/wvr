angular.module('mean.wvr')
.directive('wvrSpace', ['$timeout', '$http', '$translate', function($timeout, $http, $translate) {
    return {
        priority: 10,
        link: function(scope, elm, attrs) {
            scope.$on('spaceReached', function() {
                var defaultChannel = 'wvrmit';

                var wvrmitConnection;
                var wvrmitScreenConnection;

                var joinDisabled = false;
                var screenSharingDisabled = true;

                var actionButton = $('#action-button');
                var ownActionBtn = $('#ownBtn');
                var askForKeyActionBtn = $('#askForKeyActionBtn');
                var lockerManagerBtn = $('#lockerManagerBtn');
                var lockBtn = $('#roomLocker');
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

                var tryingToTakeSeatID;
                var tryingToTakeSeatTime;
                var tryingTakeSeatObj = {};

                var oldOnlineStatus = navigator.onLine;
                var continuousOfflineCount = 0;
                
                function reload() {
                    window.location.reload(true);
                }

                function reInitiate() {
                    wvrmitConnection.sendCustomMessage({
                        msgType: 'reInitiateRTCRoom',
                        roomId: mname,
                        requestor: wvrmitConnection.userid
                    });
                }

                function processOnlineStatusChange() {

                    if(!navigator.onLine && !oldOnlineStatus) {
                        continuousOfflineCount = continuousOfflineCount + 1;
                    }

                    if(oldOnlineStatus !== navigator.onLine) {
                        oldOnlineStatus = navigator.onLine;
                        scope.$apply(function() {
                            if(navigator.onLine) {
                                scope.operationInfo = 'You are back online. Recovering...  :)';
                                scope.alertStyle = 'alert-info';

                                if(wvrmitConnection && wvrmitConnection.isInitiator) {

                                    if(continuousOfflineCount >=3) {
                                        scope.operationInfo = 'You are offline for too long. Resetting...  :)';
                                        scope.alertStyle = 'alert-warning';

                                        fixRTCRoom();

                                        /*reInitiate();

                                        setTimeout(reload, 3000);*/
                                    } else {
                                        scope.operationInfo = 'Recovered from offline...  :)';
                                        scope.alertStyle = 'alert-info';

                                        continuousOfflineCount = 0;

                                        wvrmitConnection.playRoleOfInitiator();

                                        setTimeout(reInitiate, 3000);
                                    }

                                } else {
                                    setTimeout(reload, 1000);
                                }
                            } else {
                                scope.operationInfo = 'You are offline!!! We will try to recover when you are back online.  :(';
                                scope.alertStyle = 'alert-warning';
                            }
                        });
                    }

                    setTimeout(processOnlineStatusChange, 6000);
                }

                activateRTCRoom();

                function fixRTCRoom() {
                    actionButton.unbind();

                    wvrmitConnection.sendCustomMessage({
                        msgType: 'fixRTCRoom',
                        roomId: mname
                    });

                    setButton(actionButton, 'TXT_TAKECHARGEING', true);

                    setTimeout(function() {
                        if(!roomFixed) {
                            setButton(actionButton, 'TXT_TAKECHARGE_FAILED', true);
                        }
                    }, 60000);
                }

                function activateRTCRoom() {

                    scope.actionText = 'TXT_MARCHING';
                    actionButton.attr('disabled', true);
                    actionButton.attr('style', 'display:');

                    wvrmitConnection = new RTCMultiConnection(defaultChannel);
                    scope.webrtcRoom = mname;
                    scope.webrtcConnection = wvrmitConnection;

                    wvrmitConnection.userid = userID;

                    setTimeout(checkForReset, 60000);

                    function checkForReset() {
                        var styleString = actionButton.attr('style');
                        if(!styleString || styleString.indexOf('display:none') === -1) {
                            setButton(actionButton, 'TXT_TAKECHARGE', false);

                            actionButton.unbind();
                            actionButton.bind('click', fixRTCRoom);
                        }
                    }

                    wvrmitConnection.autoCloseEntireSession = false;

                    if(window.openSignalingChannel) {
                        wvrmitConnection.openSignalingChannel = window.openSignalingChannel;
                    } else if(window.customSignaling && window.customSignaling === 'firebase' && window.signalingServer) {
                        wvrmitConnection.firebase = window.signalingServer;
                    }

                    function isEmpty(session) {
                        if (!session) {
                            throw 'Parameter is requried.';
                        }

                        var stringified = JSON.stringify(session);
                        if (stringified === '{}' || !stringified.split(',').length) {
                            return true;
                        }
                        return false;
                    }

                    wvrmitConnection.ondisconnected = function (event) {
                        if(navigator.onLine) {
                            scope.$apply(function() {
                                scope.operationInfo = 'Peer[' + event.userid + '] disconnected! Checking presence...';
                                scope.alertStyle = 'alert-warning';
                            });
                        }

                        if (isEmpty(wvrmitConnection.channels)) {
                            return;
                        }
                        if (!wvrmitConnection.channels[event.userid]) {
                            return;
                        }

                        // use WebRTC data channels to detect user's presence
                        wvrmitConnection.channels[event.userid].send({
                            checkingPresence: true
                        });

                        // wait 6 seconds, if target peer didn't response, simply disconnect
                        setTimeout(function() {
                            // iceConnectionState === 'disconnected' occurred out of low-bandwidth
                            // or internet connectivity issues
                            if (wvrmitConnection.peers[event.userid].connected) {
                                scope.$apply(function() {
                                    scope.operationInfo = 'Peer[' + event.userid + '] reconnected!';
                                    scope.alertStyle = 'alert-info';
                                });

                                delete wvrmitConnection.peers[event.userid].connected;
                                return;
                            }

                            scope.$apply(function() {
                                scope.operationInfo = 'Peer[' + event.userid + '] left!';
                                scope.alertStyle = 'alert-warning';
                            });

                            // to make sure this user's all remote streams are removed.
                            wvrmitConnection.streams.remove({
                                remote: true,
                                userid: event.userid
                            });

                            wvrmitConnection.remove(event.userid);

                        }, 6000);
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
                            //setButton(actionButton, 'TXT_CHECKING', true);
                        }

                        if(state.name == 'room-available') {
                            setButton(actionButton, 'TXT_ACCESSING', true, true);
                        }

                        if(state.name == 'room-not-available') {
                            setButton(actionButton, 'TXT_NOTACCESSIBLE', true);
                        }

                        if(state.name == 'connected-with-initiator') {
                            //displaySpace();
                        }

                        if(state.name == 'request-accepted') {
                            displaySpace();

                            var useKeyBtn = $('#askForKeyActionBtn');
                            if(useKeyBtn.size() === 1) {
                                setButton(useKeyBtn, '', true, true);
                            }
                        }

                        if(state.name == 'request-rejected') {
                            setButton(actionButton, 'TXT_REJECTED', true);

                            joinDisabled = false;
                            if(!joinDisabled) {
                                enableRequestToJoin(true);
                            }
                        }

                        if(state.name == 'failed---has reason') {
                            setButton(actionButton, 'TXT_NOTACCESSIBLE', true);
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

                        var userVideo = $('#' + e.streamid);
                        if(userVideo) {
                            var userVideoBox = userVideo.parent().parent().parent();
                            var userVideoBoxType = userVideoBox.attr('data-space-type');
                            if(userVideoBoxType === 'freespace') {
                                userVideoBox.remove();
                            } else if(userVideoBoxType === 'seat') {
                                var seatTakeElement = $('<a/>');
                                seatTakeElement.bind('click', takeSeatHandler);
                                var userVideoPElement = userVideo.parent().parent();
                                userVideoPElement.children().remove();
                                $('<img/>').attr('src', 'https://edening.oss-cn-shenzhen.aliyuncs.com/img/ws-cube-md.png').appendTo(seatTakeElement);
                                userVideoPElement.append(seatTakeElement);
                            }
                        }
                    };

                    wvrmitConnection.onNewSession = function (session) {
                        //console.log('wvrmitConnection.onNewSession: ' + JSON.stringify(session));

                        // session.userid
                        // session.sessionid
                        // session.extra
                        // session.session i.e. {audio,video,screen,data}

                        setButton(actionButton, 'TXT_ACCESSING', true, true);

                        if (session.sessionid == mname) {

                            //console.log('onNewSession: ' + JSON.stringify(session));

                            currentSessionToJoin = session;

                            if(!wvrmitConnection.isInitiator && wvrmitConnection.sessionid) {
                                wvrmitConnection.dontCaptureUserMedia = true;
                            }

                            if(session.session.status && session.session.status.locked) {

                                setButton(askForKeyActionBtn, '', false, false);

                                askForKeyActionBtn.bind('click', askForKey);

                                if(!isEnablingRequestToJoin && !joinDisabled) {
                                    enableRequestToJoin(false, session);
                                }
                            } else {
                                wvrmitConnection.join(session);
                            }
                        }

                    };

                    /*wvrmitConnection.onSessionClosed = function(session) {
                        if (session.isEjected) {
                            console.log(session.userid, 'ejected you.  :(');
                        } else {
                            scope.$apply(function() {
                                scope.operationInfo = 'Encountered problem!!! Recovering...';
                                scope.alertStyle = 'alert-warning';
                            });

                            if(wvrmitConnection && !wvrmitConnection.isInitiator) {
                                setTimeout(recover, 6000);
                            }
                        }
                    };*/

                    sendMsgButton.on('click', function() {
                        var msgBody = $('#message-text').val() || '';
                        if (msgBody && msgBody !== '') {
                            var targets = scope.imers;

                            if (targets.size > 0) {
                                targets.forEach(function(value1, value2, set) {
                                    wvrmitConnection.sendCustomMessage({msgType: 'IM', sender: wvrmitConnection.userid, receiver: value1, message: msgBody});
                                });
                            } else {
                                wvrmitConnection.send(msgBody);
                            }
                            //messageArea.append($('<div>').append('Me: ' + msgBody));
                            messageArea.append($('<div>').append(msgBody + ' --- ' + 'Me'));
                        } else{
                            alert('Please input message content correctly!');
                        }
                    });

                    wvrmitConnection.onopen = function(e) {
                        // e.userid
                        // e.extra

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

                        //messageArea.append($('<div>').append(userName + ': ' + e.data));
                        messageArea.append($('<div>').append(e.data + ' --- ' + userName));
                    };

                    wvrmitConnection.onCustomMessage = function(msg) {

                        //console.log('onCustomMessage: ' + JSON.stringify(msg));

                        if(msg.msgType === 'TryingToTakeSeat') {
                            if(!tryingTakeSeatObj[msg.seatID] || msg.triedTime < tryingTakeSeatObj[msg.seatID]) {
                                tryingTakeSeatObj[msg.seatID] = msg.triedTime;
                            }
                        }

                        if(msg.msgType == 'SeatTaken') {
                            takeSeat(msg.seatID, msg.takerID);
                        }

                        if(msg.msgType == 'IM' && msg.receiver == wvrmitConnection.userid) {
                            //messageArea.append($('<div>').append(msg.sender + ': ' + msg.message));
                            messageArea.append($('<div>').append(msg.message + ' --- ' + msg.sender));
                        }

                        if(msg.msgType === 'initiateRoom' && msg.roomId === mname && msg.initiator === wvrmitConnection.userid) {
                            setButton(actionButton, 'TXT_ACCESSING', true, true);

                            if(!wvrmitConnection.isInitiator) {
                                wvrmitConnection.isInitiator = true;

                                if(scope.space.locker) {
                                    setButton(askForKeyActionBtn, '', false, false);

                                    askForKeyActionBtn.bind('click', askForKey);
                                } else {
                                    initiateRoom(mname);
                                }
                            }
                        }

                        if(msg.msgType === 'rtcRoomFixed' && msg.roomId === mname && msg.requester === wvrmitConnection.userid) {
                            roomFixed = true;
                            setButton(actionButton, '', true, true);
                            reload();
                            /*reInitiate();
                            setTimeout(reload, 3000);*/
                        }

                        if(msg.msgType === 'reInitiateRTCRoom' && msg.roomId === mname && msg.requester !== wvrmitConnection.userid) {
                            /*var numOfSeconds = Math.round((Math.random()*1000)%10);

                            setTimeout(reload, numOfSeconds*1000);*/
                            //alert('Reset!!!');
                            reload();
                        }

                        if(msg.msgType === 'RoomStatusChange' && msg.roomId === mname) {
                            if(scope.space.locker) {

                                lockBtn.bind('click', lockHandler);

                                scope.$apply(function() {
                                    if(msg.status === 'locked') {
                                        scope.space.locked = true;
                                        scope.lockStatusText = 'TXT_UNLOCK';
                                    } else if(msg.status === 'unlocked') {
                                        scope.space.locked = false;
                                        scope.lockStatusText = 'TXT_LOCK';
                                    }
                                });
                            }
                        }

                    };

                    //wvrmitConnection.fakeDataChannels = true;

                    wvrmitConnection.connect();

                }


                function askForKey() {
                    //Ask for key
                    $translate('TXT_SHOWPASS').then(function (msg) {
                        var key = prompt(msg);
                        if(key != null && key != '') {
                            processKey(key);
                        }
                    });
                }

                function processKey(key) {

                    $http
                        .post('/api/wvr/space/key', {
                        //.post('/api/proxy/wvr/space/key', {
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

                                if(askForKeyActionBtn) {
                                    setButton(askForKeyActionBtn, '', false, false);
                                }
                            } else {
                                $translate('TXT_SHOWPASS').then(function (msg) {
                                    key = prompt(msg);
                                    if(key != null && key != '') {
                                        processKey(key);
                                    }
                                });
                            }
                        })
                        .error(function(response) {
                            $translate('INFO_SPACESERVICE_UNAVAILABLE').then(function (msg) {
                                alert(msg);
                            });
                        });
                }

                function initiateRoom(roomId) {

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

                    setButton(actionButton, '', true, true);
                }

                function getUserID() {

                    var result = (Math.round(Math.random() * 999999999) + 999999999).toString();

                    var loginUser = scope.loginUser;

                    if (loginUser && loginUser._id && loginUser._id !== '') {
                        result = loginUser.name + '-' + loginUser._id + '_' + result;
                    }

                    return result;
                }

                function enableRequestToJoin(retry, session) {

                    isEnablingRequestToJoin = true;

                    if(retry) {
                        wvrmitConnection.dontCaptureUserMedia = true;
                    }

                    setButton(actionButton, 'TXT_KNOCK', false);

                    actionButton.unbind();
                    actionButton.bind('click', requestToJoinHandler);

                    function requestToJoinHandler() {
                        joinDisabled = true;
                        actionButton.unbind('click', requestToJoinHandler);

                        if(session) {
                            wvrmitConnection.session.actionType = 'Knock';
                            wvrmitConnection.join(session);
                        } else {
                            wvrmitConnection.join(mname);
                        }
                        setButton(actionButton, 'TXT_KNOCKING', true);

                        isEnablingRequestToJoin = false;

                    }
                }

                function setButton(button, text, disable, hide) {
                    if(button) {
                        if(text && text !== '') {
                            scope.$apply(function() {
                                scope.actionText = text;
                            });
                        }

                        button.attr('disabled', disable);
                        if(hide){
                            button.attr('style', 'display:none');
                        } else{
                            button.attr('style', 'display:');
                        }
                    }
                }

                function doMasonry() {
                    container.masonry();
                }

                function addUser(e) {
                    var userPresenceBox = $('<div/>').attr('class', 'box-masonry photo col2 masonry-brick').attr('data-space-type', 'freespace');
                    var userTxt = e.userid;
                    var index = userTxt.lastIndexOf('-');
                    var userName;
                    if(index !== -1) {
                        userName = userTxt.substr(0, index);
                    } else {
                        userName = userTxt;
                    }

                    var video = $(e.mediaElement).attr('controls', false).attr('height', '161px').attr('width', '230px');

                    var videoSpan = $('<span/>');
                    var userSpan = $('<span/>').text(userName);
                    var newPElement;
                    video.appendTo(videoSpan);
                    newPElement = $('<p/>');
                    videoSpan.appendTo(newPElement);
                    var userPElement = $('<p/>');
                    userPElement.appendTo(newPElement);
                    userSpan.appendTo(userPElement);

                    newPElement.appendTo(userPresenceBox);
                    userPresenceBox.appendTo(container);

                    setTimeout(doMasonry, 1);

                    var videoDOMObj = video.get(0);

                    setTimeout(playVideo, 1);

                    function playVideo() {
                        videoDOMObj.volume = 0.6;

                        videoDOMObj.play();
                    }
                }

                function lockHandler() {

                    var roomStatus;

                    scope.$apply(function() {
                        scope.space.locked = !scope.space.locked;

                        if(scope.space.locked) {
                            roomStatus = 'locked';
                            scope.lockStatusText = 'TXT_UNLOCK';
                        } else {
                            roomStatus = 'unlocked';
                            scope.lockStatusText = 'TXT_LOCK';
                        }
                    });

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
                        var facilities;
                        var facility;
                        var facilityElement;

                        setButton(askForKeyActionBtn, '', true, true);
                        setButton(sendMsgButton, '', false, false);

                        if(space) {

                            if(!space.owner) {
                                setButton(ownActionBtn, '', false, false);
                                ownActionBtn.bind('click', scope.ownSpace);
                            } else {
                                if(space.locker) {
                                    space.locked = false;

                                    scope.lockStatusText = 'TXT_LOCK';
                                    lockBtn.bind('click', lockHandler);

                                    if(space.uuid !== 'trial' && scope.loginUser && scope.space.owner && (scope.loginUser._id === scope.space.owner._id)) {
                                        lockerManagerBtn.unbind();

                                        scope.lockerStatusText = 'TXT_CHNAGELOCKER';

                                        lockerManagerBtn.bind('click', scope.changeLocker);
                                    }
                                } else if(scope.loginUser && scope.space.owner && (scope.loginUser._id === scope.space.owner._id)) {
                                    lockerManagerBtn.unbind();

                                    scope.lockerStatusText = 'TXT_ADDLOCKER';

                                    lockerManagerBtn.bind('click', scope.addLocker);
                                }
                            }

                            if(space.facilities) {
                                facilities = space.facilities;

                                for(var i = 0; i < facilities.length; i++) {
                                    facility = facilities[i];
                                    facilityElement = $('#' + facility._id);
                                    if(facilityElement.length == 1) {
                                        if(facility.type === "Seat") {
                                            var seatTakeElement = $('<a/>');
                                            $('<img/>').attr('src', 'https://edening.oss-cn-shenzhen.aliyuncs.com/img/ws-cube-md.png').appendTo(seatTakeElement);
                                            seatTakeElement.bind('click', takeSeatHandler);
                                            seatTakeElement.appendTo(facilityElement);
                                        } else if(facility.type === "SpaceGate" && facility.extra && facility.extra.address) {
                                            var spaceURL = '/spaces/' + facility.extra.address;
                                            var enterSpaceElement = $('<a/>').attr('href', spaceURL).attr('_target', '_self');
                                            $('<img/>').attr('src', 'https://edening.oss-cn-shenzhen.aliyuncs.com/img/team-space-md.png').appendTo(enterSpaceElement);
                                            enterSpaceElement.bind('click', enterSpaceHandler);
                                            enterSpaceElement.appendTo(facilityElement);
                                            $('<button/>').attr('class', 'btn btnIptSmOR badge').text(facility.extra.address).appendTo($('#facility-' + facility._id));
                                        }
                                    }
                                }
                            }

                            enableScreen();
                        }
                    });

                    setTimeout(doMasonry, 1);

                    setTimeout(processOnlineStatusChange, 6000);

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

                            scope.$apply(function() {
                                if(e.type === 'local') {
                                    scope.screenAction = function() {
                                        scope.shareText = 'TXT_PROCESSING';
                                        setButton($('#screenActionButton'), '', true);
                                        wvrmitScreenConnection.close();
                                        setTimeout(enableScreenSharing, 1000);
                                    };
                                    scope.shareText = 'TXT_SHARING_SELF';
                                    setButton($('#screenActionButton'), '', false);
                                } else {
                                    if(e.mediaElement.play) {
                                        e.mediaElement.play();
                                    }
                                    scope.shareText = 'TXT_SHARING_OTHER';
                                    setButton($('#screenActionButton'), '', true);
                                }
                            });

                        }
                    };

                    wvrmitScreenConnection.onstreamended = function(e) {
                        if(e.isScreen && e.type === 'local') {
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
                        if(scope.screenOpen) {
                            scope.operationInfo = 'INFO_NEEDSEXTENSION_SCREEN';
                            scope.alertStyle = 'alert-info';
                        } else {
                            scope.operationInfo = '';
                        }
                    };

                    wvrmitScreenConnection.connect();
                }

                function enableScreenSharing() {

                    if(wvrmitScreenConnection) {

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

                            scope.$apply(function() {
                                scope.screenAction = startSharing;
                                scope.shareText = 'TXT_SHARE';
                            });
                            setButton($('#screenActionButton'), '', false);
                            screenSharingDisabled = true;
                        }, 3000);
                    }

                }

                function startSharing() {
                    scope.shareText = 'TXT_PROCESSING';
                    setButton($('#screenActionButton'), '', true);

                    wvrmitScreenConnection.isInitiator = true;
                    // screen sender don't need to receive any media.
                    // so both media-lines must be "sendonly".
                    wvrmitScreenConnection.sdpConstraints.mandatory = {
                        OfferToReceiveAudio: false,
                        OfferToReceiveVideo: false
                    };
                    wvrmitScreenConnection.open(mname + '-screen');
                }

                function takeSeatHandler() {

                    var seatTakeElement = $(this);
                    var desSeatElement = seatTakeElement.parent();
                    var desSeatID = desSeatElement.attr('id');

                    var seatTakerID = selfStreamID;

                    tryingToTakeSeatTime = Date.now();
                    tryingToTakeSeatID = desSeatID;
                    wvrmitConnection.sendCustomMessage({msgType: 'TryingToTakeSeat', seatID: desSeatID, triedTime: tryingToTakeSeatTime});

                    setTimeout(function() {
                        if(!tryingTakeSeatObj[desSeatID] || tryingToTakeSeatTime < tryingTakeSeatObj[desSeatID]) {
                            takeSeat(desSeatID);

                            if(seatTakenMsgInterval) {
                                clearInterval(seatTakenMsgInterval);
                            }
                            seatTakenMsgInterval = setInterval(function() {
                                wvrmitConnection.sendCustomMessage({msgType: 'SeatTaken', seatID: desSeatID, takerID: seatTakerID});
                            }, 1000);
                        }
                    }, 1800);

                }

                function takeSeat(seatID, takerID) {

                    takerID = takerID || selfStreamID;

                    if(seatID && takerID) {
                        var desSeatElement = $('#' + seatID);
                        var userVideoElement = $('#' + takerID);
                        var userPElement = userVideoElement.parent().parent();
                        var userDivElement = userPElement.parent();
                        var spaceType = userDivElement.attr('data-space-type');
                        var takerPosition = userPElement.attr('id');

                        if(takerPosition !== seatID) {//Only taking action if the taker is not on the requested seat.

                            if(desSeatElement.length == 1 && userVideoElement.length == 1) {

                                desSeatElement.children().remove();
                                userPElement.children().appendTo(desSeatElement);

                                if(spaceType && spaceType == 'seat') {
                                    var seatTakeElement = $('<a/>');
                                    seatTakeElement.bind('click', takeSeatHandler);
                                    userPElement.children().remove();
                                    $('<img/>').attr('src', 'https://edening.oss-cn-shenzhen.aliyuncs.com/img/ws-cube-md.png').appendTo(seatTakeElement);
                                    seatTakeElement.appendTo(userPElement);

                                    if(tryingTakeSeatObj[takerPosition]) {
                                        delete tryingTakeSeatObj[takerPosition];
                                    }
                                } else if(spaceType == 'freespace' && userDivElement) {
                                    userDivElement.remove();
                                }

                                setTimeout(doMasonry, 1);

                                var playElem = userVideoElement.get(0);

                                function playMethod() {
                                    playElem.volume = 0.6;

                                    playElem.play();
                                }

                                setTimeout(playMethod, 1);
                            }

                        }
                    }
                }

                function enterSpaceHandler() {
                    window.location.reload(true);
                }

            });
        }
    }
}]);

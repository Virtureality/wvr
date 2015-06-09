// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Experiments       - github.com/muaz-khan/WebRTC-Experiment

// This library is known as multi-user connectivity wrapper!
// It handles connectivity tasks to make sure two or more users can interconnect!

var conference = function(config, userToken) {
    var self = {
        //userToken: uniqueToken()
        userToken: userToken || uniqueToken()
    };
    var channels = '--', isbroadcaster;
    var isGetNewRoom = true;
    var sockets = [];
    var defaultSocket = { };
    /*var defaultSocket = {
        name: 'defaultSocketName'
    };
    console.log('Initial defaultSocket: ');
    for (var item in defaultSocket) {
        console.log(item + ':' + defaultSocket[item]);
    }*/
    var joinRequestProcessingWatcher = {};

    function openDefaultSocket() {
        defaultSocket = config.openSocket({
            onmessage: onDefaultSocketResponse,
            callback: function(socket) {
                defaultSocket = socket;
            }
        });
    }

    function onDefaultSocketResponse(response) {
        
        /*console.log('onDefaultSocketResponse called back for message: ' + JSON.stringify(response));
        console.log('self.userToken: ' + self.userToken);*/

        if (response.userToken == self.userToken) return;

        if (isGetNewRoom && response.roomToken && response.broadcaster) config.onRoomFound(response);

        if (response.newParticipant && self.joinedARoom && self.broadcasterid == response.userToken) onNewParticipant(response.newParticipant);

        if (response.userToken && response.joinUser == self.userToken && response.participant && channels.indexOf(response.userToken) == -1) {
            channels += response.userToken + '--';
            openSubSocket({
                isofferer: true,
                channel: response.channel || response.userToken
            });
        }

        if (response.joinRequest && response.roomOwner == self.userToken && response.requestUserToken) {
            if(channels.indexOf(response.requestUserToken) == -1) {//Processing join request only if user not joined yet.
                if(!joinRequestProcessingWatcher[response.requestUserToken] || joinRequestProcessingWatcher[response.requestUserToken] == 'retry' || response.retry) {
                    joinRequestProcessingWatcher[response.requestUserToken] = 'processing';

                    //console.log('Processing join request as the room owner.');
                    var acceptDecision = confirm(response.requestUserToken + ' is requesting to join, would you like to accept?');
                    //console.log('acceptDecision: ' + acceptDecision);

                    defaultSocket.send({
                        joinResponse: true,
                        fromUser: self.userToken,
                        toUser: response.requestUserToken,
                        acceptDecision: acceptDecision
                    });

                    if(!acceptDecision) {
                        joinRequestProcessingWatcher[response.requestUserToken] = 'retry';
                    }
                }
                /*if(!joinRequestProcessingWatcher[response.requestUserToken]) {
                    joinRequestProcessingWatcher[response.requestUserToken] = true;

                    //console.log('Processing join request as the room owner.');
                    var acceptDecision = confirm(response.requestUserToken + ' is requesting to join, would you like to accept?');
                    //console.log('acceptDecision: ' + acceptDecision);

                    defaultSocket.send({
                        joinResponse: true,
                        fromUser: self.userToken,
                        toUser: response.requestUserToken,
                        acceptDecision: acceptDecision
                    });

                    joinRequestProcessingWatcher[response.requestUserToken] = false;
                }*/
            }
        }

        if (response.joinResponse && response.toUser == self.userToken && response.fromUser) {
            config.onRoomJoinResponse(response);
        }

        // to make sure room is unlisted if owner leaves		
        if (response.left && config.onRoomClosed) {
            config.onRoomClosed(response);
        }
    }

    function openSubSocket(_config) {
        if (!_config.channel) return;
        var socketConfig = {
            channel: _config.channel,
            onmessage: socketResponse,
            onopen: function() {
                if (isofferer && !peer) initPeer();
                sockets[sockets.length] = socket;
            }
        };

        socketConfig.callback = function(_socket) {
            socket = _socket;
            this.onopen();
            /*if(_config.isJoinRequest) {
                socket.send({
                    participationRequest: true,
                    userid: _config.requestor,
                    to: _config.responsor
                });
            } else {
                this.onopen();
            }*/
        };

        var socket = config.openSocket(socketConfig),
            isofferer = _config.isofferer,
            gotstream,
            video = document.createElement('video'),
            inner = { },
            peer;

        var peerConfig = {
            attachStream: config.attachStream,
            onICE: function(candidate) {
                socket.send({
                    userToken: self.userToken,
                    candidate: {
                        sdpMLineIndex: candidate.sdpMLineIndex,
                        candidate: JSON.stringify(candidate.candidate)
                    }
                });
            },
            onRemoteStream: function(stream) {
                if (!stream) return;

                video[moz ? 'mozSrcObject' : 'src'] = moz ? stream : webkitURL.createObjectURL(stream);
                video.play();

                _config.stream = stream;
                onRemoteStreamStartsFlowing();
            },
            onRemoteStreamEnded: function(stream) {
                if (config.onRemoteStreamEnded)
                    config.onRemoteStreamEnded(stream, video);
            }
        };

        function initPeer(offerSDP) {
            if (!offerSDP) {
                peerConfig.onOfferSDP = sendsdp;
            } else {
                peerConfig.offerSDP = offerSDP;
                peerConfig.onAnswerSDP = sendsdp;
            }

            peer = RTCPeerConnection(peerConfig);
        }
        
        function afterRemoteStreamStartedFlowing() {
            gotstream = true;

            if (config.onRemoteStream)
                config.onRemoteStream({
                    video: video,
                    stream: _config.stream
                });

            if (isbroadcaster && channels.split('--').length > 3) {
                /* broadcasting newly connected participant for video-conferencing! */
                defaultSocket.send({
                    newParticipant: socket.channel,
                    userToken: self.userToken
                });
            }
        }

        function onRemoteStreamStartsFlowing() {
            if(navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i)) {
                // if mobile device
                return afterRemoteStreamStartedFlowing();
            }
            
            if (!(video.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || video.paused || video.currentTime <= 0)) {
                afterRemoteStreamStartedFlowing();
            } else setTimeout(onRemoteStreamStartsFlowing, 50);
        }

        function sendsdp(sdp) {
            socket.send({
                userToken: self.userToken,
                sdp: JSON.stringify(sdp)
            });
        }

        function socketResponse(response) {
            if (response.userToken == self.userToken) return;
            if (response.sdp) {
                inner.sdp = JSON.parse(response.sdp);
                selfInvoker();
            }

            if (response.candidate && !gotstream) {
                if (!peer) console.error('missed an ice', response.candidate);
                else
                    peer.addICE({
                        sdpMLineIndex: response.candidate.sdpMLineIndex,
                        candidate: JSON.parse(response.candidate.candidate)
                    });
            }

            if (response.left) {
                if (peer && peer.peer) {
                    peer.peer.close();
                    peer.peer = null;
                }
            }
        }

        var invokedOnce = false;

        function selfInvoker() {
            if (invokedOnce) return;

            invokedOnce = true;

            if (isofferer) peer.addAnswerSDP(inner.sdp);
            else initPeer(inner.sdp);
        }
    }

    function leave() {
        var length = sockets.length;
        for (var i = 0; i < length; i++) {
            var socket = sockets[i];
            if (socket) {
                socket.send({
                    left: true,
                    userToken: self.userToken
                });
                delete sockets[i];
            }
        }

        // if owner leaves; try to remove his room from all other users side
        if (isbroadcaster) {
            defaultSocket.send({
                left: true,
                userToken: self.userToken,
                roomToken: self.roomToken,
                roomName: self.roomName
            });
        }

        if (config.attachStream) config.attachStream.stop();
    }
    
    window.addEventListener('beforeunload', function () {
        leave();
    }, false);

    window.addEventListener('keyup', function (e) {
        if (e.keyCode == 116)
            leave();
    }, false);

    function startBroadcasting() {
        //console.log('Broadcasting requested by broadcaster: ' + self.userToken + ' roomName: ' + self.roomName);
        defaultSocket && defaultSocket.send({
            roomToken: self.roomToken,
            roomName: self.roomName,
            broadcaster: self.userToken
        });
        setTimeout(startBroadcasting, 3000);
    }

    function onNewParticipant(channel) {
        if (!channel || channels.indexOf(channel) != -1 || channel == self.userToken) return;
        channels += channel + '--';

        var new_channel = uniqueToken();
        openSubSocket({
            channel: new_channel
        });

        defaultSocket.send({
            participant: true,
            userToken: self.userToken,
            joinUser: channel,
            channel: new_channel
        });
    }

    function uniqueToken() {
        var s4 = function() {
            return Math.floor(Math.random() * 0x10000).toString(16);
        };
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
    }

    openDefaultSocket();
    return {
        createRoom: function(_config) {
            /*console.log('createRoom for video-conferencing with name: ' + _config.roomName);
            console.log('self.defaultSocket:' + self.defaultSocket);
            for (var item in self.defaultSocket) {
                console.log(item + ':' + self.defaultSocket[item]);
            }*/

            self.roomName = _config.roomName || 'Anonymous';
            self.roomToken = uniqueToken();

            if (_config.userToken && self.userToken !== _config.userToken) {
                self.userToken = _config.userToken;
            }

            //console.log('self.userToken:' + self.userToken);

            isbroadcaster = true;
            isGetNewRoom = false;
            startBroadcasting();
        },
        joinRoom: function(_config) {
            //console.log('joinRoom for video-conferencing');
            self.roomToken = _config.roomToken;
            isGetNewRoom = false;

            self.joinedARoom = true;
            self.broadcasterid = _config.joinUser;

            openSubSocket({
                channel: self.userToken
            });

            defaultSocket.send({
                participant: true,
                userToken: self.userToken,
                joinUser: _config.joinUser
            });
        },
        leaveRoom: leave,
        requestToJoin: function(_config) {
            defaultSocket.send({
                joinRequest: true,
                roomOwner: _config.roomOwner,
                requestUserToken: _config.requestUserToken,
                retry: _config.retry
            });
        }
    };
};

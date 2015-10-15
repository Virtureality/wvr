'use strict';

angular.module('mean.wvr').directive('wvrSignaling', [
  function() {

    return {
      priority: 9,
      link: function postLink(scope, elm, attrs) {
        var customSignaling = window.customSignaling;
        var SIGNALING_SERVER = window.signalingServer || 'http://localhost:8888/';
        var roomEntered = false;

        function getUserID() {

          var result = (Math.round(Math.random() * 999999999) + 999999999).toString();

          var loginUser = scope.loginUser;

          if (loginUser && loginUser._id && loginUser._id !== '') {
            result = loginUser.name + '-' + loginUser._id;
          }

          return result;
        }

        function loadScript(src, onload) {
          var script = document.createElement('script');
          script.src = src;
          script.onload = function() {
            log('loaded resource:', src);
            if (onload) {
              onload();
            }
          };
          document.documentElement.appendChild(script);
        }

        if(customSignaling) {
          if(customSignaling === 'socketio') {
            window.openSignalingChannel = function (config) {///socketio for signaling
              /*if(!io) {
                loadScript(ioURL || 'http://localhost:8888/socketio.js', function() {
                  console.log('io loaded.');
                });
              }*/

              scope.currentUserID = scope.currentUserID || getUserID();
              var channel = config.channel || this.channel;

              io.connect(SIGNALING_SERVER).emit('new-channel', {
                channel: channel,
                sender: scope.currentUserID
              });

              var socket = io.connect(SIGNALING_SERVER + channel);
              socket.channel = channel;

              socket.on('connect', function () {
                if (config.callback) config.callback(socket);

                if(socket.channel != 'wvrmit-screen' && !roomEntered) {
                  roomEntered = true;
                  socket.emit('room-reached', {
                    room: scope.webrtcRoom || 'default',
                    userid: scope.currentUserID
                  });
                }
              });

              socket.send = function (message) {
                console.log('Emitting message: ' + JSON.stringify({sender: scope.currentUserID, data: message}));

                socket.emit('message', {
                  sender: scope.currentUserID,
                  data: message
                });
              };

              socket.on('message', config.onmessage);
              /*socket.on('message', onmessage);

              function onmessage(responseMsg) {
                if(responseMsg.sessionid && responseMsg.userid && (responseMsg.userid === scope.currentUserID)) {
                  scope.webrtcConnection.open({sessionid: responseMsg.sessionid, dontTransmit: true});
                }

                config.onmessage(responseMsg);
              }*/

              /*window.addEventListener('beforeunload', leaveHandler);

              function leaveHandler() {
                //console.log('Disconnected your sockets, peers, streams and everything except RTCMultiConnection object.');
                socket.emit('disconnect', {socketId: socket.id});
              }*/

            };
          }
        }
      }
    }

  }

]);
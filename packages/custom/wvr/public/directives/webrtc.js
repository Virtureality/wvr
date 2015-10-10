'use strict';

angular.module('mean.wvr').directive('wvrSignaling', [
  function() {

    return {
      priority: 9,
      link: function postLink(scope, elm, attrs) {
        var customSignaling = window.customSignaling;
        var SIGNALING_SERVER = window.signalingServer || 'http://localhost:8888/';
        var sender = getUserID();
        scope.currentUserID = sender;

        function getUserID() {
          var result = (Math.round(Math.random() * 999999999) + 999999999).toString();

          var loginUser = scope.loginUser;

          if (loginUser && loginUser._id && loginUser._id !== '') {
            result = loginUser.name + '-' + loginUser._id;
          }

          return result;
        }

        if(customSignaling) {
          if(customSignaling === 'socketio') {
            window.openSignalingChannel = function (config) {///socketio for signaling
              var channel = config.channel || this.channel;

              io.connect(SIGNALING_SERVER).emit('new-channel', {
                channel: channel,
                sender: sender
              });

              var socket = io.connect(SIGNALING_SERVER + channel);
              socket.channel = channel;

              socket.on('connect', function () {
                if (config.callback) config.callback(socket);
              });

              socket.send = function (message) {
                socket.emit('message', {
                  sender: sender,
                  data: message
                });
              };

              socket.on('message', config.onmessage);

            };
          }
        }
      }
    }

  }

]);
'use strict';

angular.module('mean.wvr').directive('wvrSignaling', [
  function() {

    return {
      priority: 9,
      link: function postLink(scope, elm, attrs) {
        var customSignaling = window.customSignaling;
        var SIGNALING_SERVER = window.signalingServer || 'http://localhost:8888/';

        if(customSignaling) {
          if(customSignaling === 'socketio') {
            window.openSignalingChannel = function (config) {///socketio for signaling
              var channel = config.channel || this.channel;
              var sender = Math.round(Math.random() * 999999999) + 999999999;

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
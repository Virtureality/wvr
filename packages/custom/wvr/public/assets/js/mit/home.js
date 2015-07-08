$(function(){

	function start() {

		var roomsContainer = $('#meetingsContainer');

		var scope = angular.element($("#mitArea")).scope();
		var mits = scope.mits || {};

		var wvrmitConnection = new RTCMultiConnection('wvrmit');

		if(window.openSignalingChannel) {
			wvrmitConnection.openSignalingChannel = window.openSignalingChannel;
		} else if(window.customSignaling && window.customSignaling === 'firebase' && window.signalingServer) {
			wvrmitConnection.firebase = window.signalingServer;
		}

		wvrmitConnection.onNewSession = function (session) {

			/*console.log('New Session: ' + session.sessionid + ' found!');

			console.log('Adding new session ...');*/
			//console.log('onNewSession: ' + JSON.stringify(session));

			if(!session.left) {//To make sure it works only for real new session events. Note: This is only just a temporary workaround, good solution should be sth at RMC onmessage() level. TODO: To verify!!!
				if(!mits[session.sessionid]) {
					scope.$apply(function(){
						mits[session.sessionid] = session;
					});
				}
			}

		};

		wvrmitConnection.onSessionClosed = function (e) {
			// entire session is closed

			// e.userid
			// e.extra
			// e.isSessionClosed

			// e.session == connection.sessionDescription
			// e.session.sessionid
			// e.session.userid --- initiator id
			// e.session.session -- {audio:true, video:true}

			//console.log('Session: ' + e.session.sessionid + ' closed!');
			//console.log('Before deleting[' + e.session.sessionid + '] wvrmitConnection.sessionDescriptions: ' + JSON.stringify(wvrmitConnection.sessionDescriptions));

			if(wvrmitConnection.sessionDescriptions[e.session.sessionid]) {
				delete wvrmitConnection.sessionDescriptions[e.session.sessionid];
			}

			if(mits[e.session.sessionid]) {
				scope.$apply(function(){
					delete mits[e.session.sessionid];
				})
			}
		};

		wvrmitConnection.connect();

	}

	setTimeout(start, 1);

});
/**
 * New JS file
 */

var container = $('#container');

//$(function(){
function startOT(apiKey, sessionId, token) {
	//var apiKey = 45209542;
	//var sessionId = '1_MX40NTIwOTU0Mn5-MTQyOTA5NTA0Mzc0NX45ZzZhUUhpcFZacXE4d1BVemhKVnl5aDJ-fg';
	var session = OT.initSession(apiKey, sessionId);
	//var publisher = OT.initPublisher();

	//var token = 'T1==cGFydG5lcl9pZD00NTIwOTU0MiZzaWc9M2EyODdmMjBiOGJlZDZlZTM3ZWE1NGU1ZTViOTAwMTJhNmM1YzNkMDpyb2xlPXB1Ymxpc2hlciZzZXNzaW9uX2lkPTFfTVg0ME5USXdPVFUwTW41LU1UUXlPVEE1TlRBME16YzBOWDQ1WnpaaFVVaHBjRlphY1hFNGQxQlZlbWhLVm5sNWFESi1mZyZjcmVhdGVfdGltZT0xNDI5MDk5MDgxJm5vbmNlPTAuNjM1NDExOTczOTQ4ODQwNyZleHBpcmVfdGltZT0xNDI5MTIwNjIzJmNvbm5lY3Rpb25fZGF0YT0=';

	session.on({
		streamCreated: function(event) { 
			//session.subscribe(event.stream, 'subscribersDiv', {insertMode: 'append'});
			var videoBox = $('<div/>').attr('class', 'box photo col2 masonry-brick');
		    videoBox.appendTo(container);

			session.subscribe(event.stream, videoBox.get(0), {insertMode: 'append', audioVolume: 6, fitMode: 'contain', width: 168, height: 126});
			
			container.masonry('appended', videoBox);
			
		}
	});

	session.connect(token, function(error) {
		if (error) {
			console.log(error.message);
		} else {
			console.log('connected to session');
			//session.publish('myPublisherDiv', {width: 320, height: 240});
			var videoBox = $('<div/>').attr('class', 'box photo col2 masonry-brick');
		    videoBox.appendTo(container);
		    session.publish(videoBox.get(0), {insertMode: 'append', audioVolume: 6, fitMode: 'contain', width: 168, height: 126});
		    
		    container.masonry('appended', videoBox);
		    
			/*session.publish(publisher);*/
		}
	});
}
//});
'use strict';

var mean = require('meanio');

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Wvr, app, auth, database) {

  // Home route
  app.route('/wvr/*')
    .get(function(req, res, next) {
    	res.header('workerID' , JSON.stringify(mean.options.workerid) );
    	res.render('home', {
    		package: 'wvr'
    	}, function(err, html) {
    		//Rendering a view from the Package server/views
    		res.send(html);
    	});
    });
  
  //app.route('/*')
  //.get(function(req, res, next) {
	//  res.redirect('/');
  //});

};

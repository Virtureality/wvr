'use strict';

var mean = require('meanio');

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Wvr, app, auth, database) {

/*  app.get('/wvr/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/wvr/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/wvr/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/wvr/example/render', function(req, res, next) {
    Wvr.render('index', {
      package: 'wvr'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });*/

  // Home route
  app.route('/wvr')
    .get(function(req, res, next) {
          Wvr.render('home', {
            package: 'wvr'
          }, function(err, html) {
            //Rendering a view from the Package server/views
            res.send(html);
          });
        });


  app.get('/wvr/*',function(req,res,next){
        res.header('workerID' , JSON.stringify(mean.options.workerid) );
        next(); // http://expressjs.com/guide.html#passing-route control
  });

};

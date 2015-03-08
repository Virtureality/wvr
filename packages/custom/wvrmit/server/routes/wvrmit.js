'use strict';

/* jshint -W098 */
// The Package is past automatically as first parameter
module.exports = function(Wvrmit, app, auth, database) {

  app.get('/wvrmit/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/wvrmit/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/wvrmit/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/wvrmit/example/render', function(req, res, next) {
    Wvrmit.render('index', {
      package: 'wvrmit'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};

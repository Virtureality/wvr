/* globals require */
'use strict';

/**
 * Module dependencies.
 */
var mean = require('meanio'),
  compression = require('compression'),
  //morgan = require('morgan'),
  consolidate = require('consolidate'),
  express = require('express'),
  helpers = require('view-helpers'),
  flash = require('connect-flash'),
  modRewrite = require('connect-modrewrite'),
  // seo = require('mean-seo'),
  appConfig = mean.loadConfig();


module.exports = function(app, db) {

  /* Note: using staging server url, remove .testing() for production
   Using .testing() will overwrite the debug flag with true */
  /*var LEX = require('letsencrypt-express').testing();

  // Change these two lines!
  var DOMAIN = 'localhost';
  var EMAIL = 'mahaofeng81@163.com';

  var lex = LEX.create({
    configDir: appConfig.https.letsencryptDir
    , onRequest: app
    , approveRegistration: function (hostname, approve) { // leave `null` to disable automatic registration
      if (hostname === DOMAIN) { // Or check a database or list of allowed domains
        approve(null, {
          domains: [DOMAIN]
          , email: EMAIL
          , agreeTos: true
        });
      }
    }
  });*/

  app.set('showStackError', true);

  // Prettify HTML
  app.locals.pretty = true;

  // cache=memory or swig dies in NODE_ENV=production
  app.locals.cache = 'memory';

  // Should be placed before express.static
  // To ensure that all assets and data are compressed (utilize bandwidth)
  app.use(compression({
    // Levels are specified in a range of 0 to 9, where-as 0 is
    // no compression and 9 is best compression, but slowest
    level: 9
  }));

  // Enable compression on bower_components
  app.use('/bower_components', express.static(appConfig.root + '/bower_components'));

  // Adds logging based on logging config in config/env/ entry
  require('./middlewares/logging')(app, appConfig.logging);

  // assign the template engine to .html files
  app.engine('html', consolidate[appConfig.templateEngine]);

  // set .html as the default extension
  app.set('view engine', 'html');


  // Dynamic helpers
  app.use(helpers(appConfig.app.name));

  // Connect flash for flash messages
  app.use(flash());

  app.use(modRewrite([
    
    '!^/api/.*|\\_getModules|\\.crx|\\.html|\\.js|\\.css|\\.swf|\\.jp(e?)g|\\.png|\\.gif|\\.svg|\\.eot|\\.ttf|\\.woff|\\.pdf$ / [L]'

  ]));

  // app.use(seo());

  /*var LE = require('letsencrypt');


  var leConfig = {
    server: LE.stagingServerUrl                               // or LE.productionServerUrl

    , configDir: './letsencrypt/etc'      // or /etc/letsencrypt or wherever

    , privkeyPath: ':config/live/:hostname/privkey.pem'         //
    , fullchainPath: ':config/live/:hostname/fullchain.pem'     // Note: both that :config and :hostname
    , certPath: ':config/live/:hostname/cert.pem'               //       will be templated as expected
    , chainPath: ':config/live/:hostname/chain.pem'             //

    , debug: false
  };


  var handlers = {
    setChallenge: function (opts, hostname, key, val, cb) {}  // called during the ACME server handshake, before validation
    , removeChallenge: function (opts, hostname, key, cb) {}    // called after validation on both success and failure
    , getChallenge: function (opts, hostname, key, cb) {}       // this is special because it is called by the webserver
                                                                // (see letsencrypt-cli/bin & letsencrypt-express/standalone),
                                                                // not by the library itself

    , agreeToTerms: function (tosUrl, cb) {}                    // gives you an async way to expose the legal agreement
                                                                // (terms of use) to your users before accepting
  };


  var le = LE.create(leConfig, handlers);

  // checks :conf/renewal/:hostname.conf
  le.register({                                                 // and either renews or registers

    domains: ['localhost']                                    // CHANGE TO YOUR DOMAIN
    , email: 'mahaofeng81@163.com'                                     // CHANGE TO YOUR EMAIL
    , agreeTos: true                                             // set to true to automatically accept an agreement
                                                                  // which you have pre-approved (not recommended)
  }, function (err) {

    if (err) {
      // Note: you must have a webserver running
      // and expose handlers.getChallenge to it
      // in order to pass validation
      // See letsencrypt-cli and or letsencrypt-express
      console.error('[Error]: node-letsencrypt/examples/standalone');
      console.error(err.stack);
    } else {
      console.log('success');
    }
  });

  app.use('/', le.middleware());*/

};

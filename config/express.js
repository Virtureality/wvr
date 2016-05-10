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
  config = mean.loadConfig();
    //LE = require('letsencrypt')
    //lex = require('letsencrypt-express').testing();

module.exports = function(app, db) {

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
  app.use('/bower_components', express.static(config.root + '/bower_components'));

  // Adds logging based on logging config in config/env/ entry
  require('./middlewares/logging')(app, config.logging);

  // assign the template engine to .html files
  app.engine('html', consolidate[config.templateEngine]);

  // set .html as the default extension
  app.set('view engine', 'html');


  // Dynamic helpers
  app.use(helpers(config.app.name));

  // Connect flash for flash messages
  app.use(flash());

  app.use(modRewrite([
    
    '!^/api/.*|\\_getModules|\\.crx|\\.html|\\.js|\\.css|\\.swf|\\.jp(e?)g|\\.png|\\.gif|\\.svg|\\.eot|\\.ttf|\\.woff|\\.pdf$ / [L]'

  ]));

  // app.use(seo());

  /*// Note: you should make this special dir in your product and leave it empty
  config.le.webrootPath = __dirname + '/../test/acme-challenge';
  config.le.server = LE.stagingServer;

  var le = LE.create(config.le, {
    sniRegisterCallback: function (args, expiredCert, cb) {
      // In theory you should never get an expired certificate because
      // the certificates automatically renew in the background starting
      // about a week before they expire.
      // (the default behavior is to randomly stagger renewals)
      // so in this case we'll just return the expired certificate
      if (expiredCert) { return cb(null, expiredCert); }

      // If we get here that means this domain hasn't been registered yet
      // Security Warning: you should either manually register domains
      // and return null here or check that the sni header isn't being
      // spoofed and this is actually a domain you own before registering
      //
      //   cb(null, null);

      var hostname = args.domains[0];
      console.log("[TODO] check that '" + hostname + "' is one I expect");

      args.agreeTos = true;
      args.email = 'mahaofeng81@163.com';

      le.register(args, cb);
    }
  });

  app.use('/', le.middleware());

  require('https').createServer({
    key: config.le.daplieTLSKey,
    cert: config.le.daplieTLSCert,
    SNICallback: le.sniCallback
  }, app).listen(config.le.tlsPort, function () {
    console.log('Listening https: ', this.address());
  });*/

  /*lex.create({
    configDir: './letsencrypt.config',                 // ~/letsencrypt, /etc/letsencrypt, whatever you want
    onRequest: app,                                    // your express app (or plain node http app)
    letsencrypt: null,                                // you can provide your own instance of letsencrypt
                                                        // if you need to configure it (with an agreeToTerms
                                                        // callback, for example)
    /!*approveRegistration: function (hostname, cb) {    // PRODUCTION MODE needs this function, but only if you want automatic registration (usually not necessary) renewals for registered domains will still be automatic
      cb(null, {
        domains: [hostname],
        email: 'mahaofeng81@163.com',
        agreeTos: true
      });
    }*!/
  }).listen([80], [443, 5001], function () {
    console.log('LetsEncrypt protected https server listening on: ', this.address());
  });*/

};

'use strict';

var path = require('path'),
  rootPath = path.normalize(__dirname + '/../..');

module.exports = {
  root: rootPath,
  http: {
    port: process.env.PORT || 3000
  },
  https: {
    //port: false,
	port: process.env.SSL_PORT || 3443,

    // Paths to key and cert as string
    ssl: {
      key: rootPath + '/config/sslcert/letsencrypt/privkey.pem',
      cert: rootPath + '/config/sslcert/letsencrypt/fullchain.pem'
    },
    
    letsencryptDir: rootPath + '/config/sslcert/letsencrypt/etc'
  },
  hostname: process.env.HOST || process.env.HOSTNAME,
  db: process.env.MONGOHQ_URL,
  templateEngine: 'swig',

  // The secret should be set to a non-guessable string that
  // is used to compute a session hash
  sessionSecret: 'WVR',

  // The name of the MongoDB collection to store sessions in
  sessionCollection: 'sessions',

  // The session cookie settings
  sessionCookie: {
    path: '/',
    httpOnly: true,
    // If secure is set to true then it will cause the cookie to be set
    // only when SSL-enabled (HTTPS) is used, and otherwise it won't
    // set a cookie. 'true' is recommended yet it requires the above
    // mentioned pre-requisite.
    secure: false,
    // Only set the maxAge to null if the cookie shouldn't be expired
    // at all. The cookie will expunge when the browser is closed.
    maxAge: null
  },
  languages: [{
    name: 'en',
    direction: 'ltr'
  }, {
    name: 'he',
    direction: 'rtl'
  }],
  currentLanguage: 'en',
  // The session cookie name
  sessionName: 'connect.sid'
};

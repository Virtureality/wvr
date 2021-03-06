'use strict';

module.exports = {
  db: 'mongodb://' + (process.env.DB_PORT_27017_TCP_ADDR || 'localhost') + '/wvr-test',
  http: {
    port: 3001
  },
  logging: {
    format: 'common'
  },
  app: {
    name: 'VST - Virtual Space Time - Test'
  },
  strategies: {
      local: {
        enabled: true
      },
      facebook: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/facebook/callback',
        enabled: false
      },
      twitter: {
        clientID: 'CONSUMER_KEY',
        clientSecret: 'CONSUMER_SECRET',
        callbackURL: 'http://localhost:3000/auth/twitter/callback',
        enabled: false
      },
      github: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/github/callback',
        enabled: false
      },
      google: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/auth/google/callback',
        enabled: false
      },
      linkedin: {
        clientID: 'API_KEY',
        clientSecret: 'SECRET_KEY',
        callbackURL: 'http://localhost:3000/auth/linkedin/callback',
        enabled: false
      }
  },
    emailFrom: 'edening@yeah.net', // sender address like ABC <abc@example.com>
    mailer: {
        host: 'smtp.yeah.net',
        port: 25,
        auth: {
            user: 'edening@yeah.net',
            pass: 'fbl11111'
        }
    },
  secret: 'SOME_TOKEN_SECRET'
};

'use strict';

module.exports = {
  db: 'mongodb://' + (process.env.DB_PORT_27017_TCP_ADDR || 'localhost') + '/wvr-dev',
  debug: false,
  logging: {
    format: 'tiny'
  },
  //  aggregate: 'whatever that is not false, because boolean false value turns aggregation off', //false
  aggregate: true,
  mongoose: {
    debug: false
  },
  hostname: 'http://localhost:3000',
  app: {
    name: 'WVR - World Virtual Reality - Development'
  },
  strategies: {
      local: {
        enabled: true
      },
      facebook: {
        clientID: 'DEFAULT_APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/api/auth/facebook/callback',
        enabled: false
      },
      twitter: {
        clientID: 'DEFAULT_CONSUMER_KEY',
        clientSecret: 'CONSUMER_SECRET',
        callbackURL: 'http://localhost:3000/api/auth/twitter/callback',
        enabled: false
      },
      github: {
        clientID: 'DEFAULT_APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/api/auth/github/callback',
        enabled: false
      },
      google: {
        clientID: '1097113760048-sapo37bj7mr840fpqs8o3mfsn81iemst.apps.googleusercontent.com',
        clientSecret: 'QpZVkwrMUlYisusa37FAI1Ge',
        callbackURL: 'http://localhost:3000/api/auth/google/callback',
        enabled: true
      },
      linkedin: {
        clientID: '75oseoz1ewy3lz',
        clientSecret: 'maoSqRP5MIWsio5Y',
        callbackURL: 'http://localhost:3000/api/auth/linkedin/callback',
        enabled: true
      }
  },
  emailFrom: 'sharphill@163.com', // sender address like ABC <abc@example.com>
  mailer: {
      host: 'smtp.163.com',
      port: 25,
      auth: {
          user: 'sharphill@163.com',
          pass: 'mhf1111$'
      }
  }, 
  secret: 'FBL_WVR_TOKEN_SECRET_DEV'
};

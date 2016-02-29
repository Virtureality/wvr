'use strict';

module.exports = {
  aggregate: true,
  db: process.env.MONGODB_URI || 'mongodb://wvr:wvr11$@ds031751.mongolab.com:31751/wvr',
  // db: process.env.MONGODB_URI || 'mongodb://wvr:wvr11$@proximus.modulusmongo.net:27017/Igu9zyzo',
  /**
   * Database options that will be passed directly to mongoose.connect
   * Below are some examples.
   * See http://mongodb.github.io/node-mongodb-native/driver-articles/mongoclient.html#mongoclient-connect-options
   * and http://mongoosejs.com/docs/connections.html for more information
   */
  dbOptions: {
    /*
    server: {
        socketOptions: {
            keepAlive: 1
        },
        poolSize: 5
    },
    replset: {
      rs_name: 'myReplicaSet',
      poolSize: 5
    },
    db: {
      w: 1,
      numberOfRetries: 2
    }
    */
  },
  hostname: 'http://wvr.edening.net',
  app: {
    name: 'WVR - World Virtual Reality'
  },
  logging: {
    format: 'combined'
  },
  strategies: {
      local: {
        enabled: true
      },
      facebook: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/api/auth/facebook/callback',
        enabled: false
      },
      twitter: {
        clientID: 'CONSUMER_KEY',
        clientSecret: 'CONSUMER_SECRET',
        callbackURL: 'http://localhost:3000/api/auth/twitter/callback',
        enabled: false
      },
      github: {
        clientID: 'APP_ID',
        clientSecret: 'APP_SECRET',
        callbackURL: 'http://localhost:3000/api/auth/github/callback',
        enabled: false
      },
      google: {
        clientID: '643296998013-dj2kgmtltl3ickmuuae7f7nvs6fk2mrh.apps.googleusercontent.com',
        clientSecret: 'DS6QjSWIFd6JLFmfUJurq5K9',
        callbackURL: 'http://wvr.edening.net/api/auth/google/callback',
        enabled: true
      },
      linkedin: {
        clientID: 'API_KEY',
        clientSecret: 'SECRET_KEY',
        callbackURL: 'http://localhost:3000/api/auth/linkedin/callback',
        enabled: false
      }
  },
    /*emailFrom: 'fbl.edening@gmail.com', // sender address like ABC <abc@example.com>
    mailer: {
        service: 'gmail', // Gmail, SMTP
        auth: {
            user: 'fbl.edening@gmail.com',
            pass: 'fbl1111$'
        }
    },*/
    emailFrom: 'edening@yeah.net', // sender address like ABC <abc@example.com>
    mailer: {
        host: 'smtp.yeah.net',
        port: 25,
        auth: {
            user: 'edening@yeah.net',
            pass: 'fbl11111'
        }
    },
    secret: 'FBL_WVR_TOKEN_SECRET_PROD'
};

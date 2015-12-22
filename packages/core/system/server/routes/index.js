'use strict';

var sslEnforcer = require('express-sslify');

var mean = require('meanio');

module.exports = function(System, app, auth, database) {
    if(process.env.ENFORCE_HTTPS) {
        app.use(sslEnforcer.HTTPS({trustProtoHeader: true}));
    }

  // Home route
  var index = require('../controllers/index');
  app.route('/')
    .get(index.render);

  app.get('/*',function(req,res,next){
        res.header('workerID' , JSON.stringify(mean.options.workerid) );
        next(); // http://expressjs.com/guide.html#passing-route control
  });
};

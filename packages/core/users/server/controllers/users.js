'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  User = mongoose.model('User'),
  async = require('async'),
  config = require('meanio').loadConfig(),
  crypto = require('crypto'),
  nodemailer = require('nodemailer'),
  templates = require('../template'),
  _ = require('lodash'),
  jwt = require('jsonwebtoken'); //https://npmjs.org/package/node-jsonwebtoken



/**
 * Send reset password email
 */
function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function(err, response) {
        if (err) return err;
        return response;
    });
}



module.exports = function(MeanUser) {
    return {
        /**
         * Auth callback
         */
        authCallback: function(req, res) {
          var payload = req.user;
          var escaped = JSON.stringify(payload);      
          escaped = encodeURI(escaped);
          // We are sending the payload inside the token
          var token = jwt.sign(escaped, config.secret, { expiresInMinutes: 60*5 });
          res.cookie('token', token);
          res.redirect('/');
        },

        /**
         * Show login form
         */
        signin: function(req, res) {
          if (req.isAuthenticated()) {
            return res.redirect('/');
          }
          res.redirect('/login');
        },

        /**
         * Logout
         */
        signout: function(req, res) {

            MeanUser.events.publish('logout', {
                //description: req.user.name + ' logout.'
                description: 'Somebody logout.'
            });

            req.logout();
            res.redirect('/');
        },

        /**
         * Session
         */
        session: function(req, res) {
          res.redirect('/');
        },

        /**
         * Create user
         */
        create: function(req, res, next) {
            var user = new User(req.body);

            user.provider = 'local';

            req.assert('name', 'INFO_RULE_NAME').notEmpty();
            req.assert('email', 'INFO_RULE_VALIDEMAIL').isEmail();
            req.assert('password', 'INFO_RULE_PWD').len(8, 20);
            req.assert('username', 'INFO_RULE_USERNAME').len(1, 20);
            req.assert('confirmPassword', 'INFO_RULE_CONFIRMPWD').equals(req.body.password);

            var errors = req.validationErrors();
            if (errors) {
                return res.status(400).send(errors);
            }

            // Hard coded for now. Will address this with the user permissions system in v0.3.5
            user.roles = ['authenticated'];
            user.save(function(err) {
                if (err) {
                    switch (err.code) {
                        case 11000:
                        case 11001:
                        res.status(400).json([{
                            msg: 'Username already taken',
                            param: 'username'
                        }]);
                        break;
                        default:
                        var modelErrors = [];

                        if (err.errors) {

                            for (var x in err.errors) {
                                modelErrors.push({
                                    param: x,
                                    msg: err.errors[x].message,
                                    value: err.errors[x].value
                                });
                            }

                            res.status(400).json(modelErrors);
                        }
                    }
                    return res.status(400);
                }

                var payload = user;
                payload.redirect = req.body.redirect;
                var escaped = JSON.stringify(payload);
                escaped = encodeURI(escaped);
                req.logIn(user, function(err) {
                    if (err) { return next(err); }

                    MeanUser.events.publish('register', {
                        description: user.name + ' register to the system.'
                    });

                    // We are sending the payload inside the token
                    var token = jwt.sign(escaped, config.secret, { expiresInMinutes: 60*5 });
                    res.json({ token: token });
                });
                res.status(200);
            });
        },
        /**
         * Send User
         */
        me: function(req, res) {
            if (!req.user || !req.user.hasOwnProperty('_id')) return res.send(null);

            User.findOne({
                _id: req.user._id
            }).exec(function(err, user) {

                if (err || !user) return res.send(null);


                var dbUser = user.toJSON();
                var id = req.user._id;

                delete dbUser._id;
                delete req.user._id;

                var eq = _.isEqual(dbUser, req.user);
                if (eq) {
                    req.user._id = id;
                    return res.json(req.user);
                }

                var payload = user;
                var escaped = JSON.stringify(payload);
                escaped = encodeURI(escaped);
                var token = jwt.sign(escaped, config.secret, { expiresInMinutes: 60*5 });
                res.json({ token: token });
               
            });
        },

        /**
         * Find user by id
         */
        user: function(req, res, next, id) {
            User.findOne({
                _id: id
            }).exec(function(err, user) {
                if (err) return next(err);
                if (!user) return next(new Error('Failed to load User ' + id));
                req.profile = user;
                next();
            });
        },

        /**
         * Resets the password
         */

        resetpassword: function(req, res, next) {
            User.findOne({
                resetPasswordToken: req.params.token,
                resetPasswordExpires: {
                    $gt: Date.now()
                }
            }, function(err, user) {
                if (err) {
                    return res.status(400).json({
                        msg: err
                    });
                }
                if (!user) {
                    return res.status(400).json({
                        msg: 'Token invalid or expired'
                    });
                }
                req.assert('password', 'INFO_RULE_PWD').len(8, 20);
                req.assert('confirmPassword', 'INFO_RULE_CONFIRMPWD').equals(req.body.password);
                var errors = req.validationErrors();
                if (errors) {
                    return res.status(400).send(errors);
                }
                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;
                /*user.save(function(err) {

                    MeanUser.events.publish('resetpassword', {
                        description: user.name + ' reset his password.'
                    });

                    req.logIn(user, function(err) {
                        if (err) return next(err);
                        return res.send({
                            user: user
                        });
                    });
                });*/
                user.save(function(err) {
                    if (err) {
                        var modelErrors = [];

                        if (err.errors) {

                            for (var x in err.errors) {
                                modelErrors.push({
                                    param: x,
                                    msg: err.errors[x].message,
                                    value: err.errors[x].value
                                });
                            }

                            res.status(400).json(modelErrors);
                        }

                        return res.status(400);
                    }

                    /*var payload = user;
                    payload.redirect = req.body.redirect;
                    var escaped = JSON.stringify(payload);
                    escaped = encodeURI(escaped);
                    req.logIn(user, function(err) {
                        if (err) { return next(err); }

                        MeanUser.events.publish('resetpassword', {
                            description: user.name + ' reset his password.'
                        });

                        // We are sending the payload inside the token
                        var token = jwt.sign(escaped, config.secret, { expiresInMinutes: 60*5 });
                        res.json({ token: token });
                    });
                    res.status(200);*/
                    res.status(200).json({
                        msg: 'Password reset successfully!'
                    });
                });
            });
        },

        /**
         * Callback for forgot password link
         */
        forgotpassword: function(req, res, next) {
            async.waterfall([

                function(done) {
                    crypto.randomBytes(20, function(err, buf) {
                        var token = buf.toString('hex');
                        done(err, token);
                    });
                },
                function(token, done) {
                    User.findOne({
                        $or: [{
                            email: req.body.text
                        }, {
                            username: req.body.text
                        }]
                    }, function(err, user) {
                        if (err || !user) return done(true);
                        done(err, user, token);
                    });
                },
                function(user, token, done) {
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
                    user.save(function(err) {
                        done(err, token, user);
                    });
                },
                function(token, user, done) {
                    var mailOptions = {
                        to: user.email,
                        from: config.emailFrom,
                        lang: req.body.lang
                    };
                    mailOptions = templates.forgot_password_email(user, req, token, mailOptions);
                    /*sendMail(mailOptions);
                    done(null, user);*/
                    var transport = nodemailer.createTransport(config.mailer);
                    transport.sendMail(mailOptions, function(err, response) {
                        done(err, user, response);
                    });
                }
            ],
            function(err, user, result) {

                var response = {
                    message: 'INFO_EMAILSENT_UNKNOWN',
                    status: 'unknown'
                };
                if(result) {
                    response = result;
                    if(result.response && result.response.indexOf('250') != -1) {
                        response.message = 'INFO_EMAILSENT';
                        response.status = 'success';
                    } else {
                        response.message = 'INFO_EMAILSENT_UNKNOWN';
                        response.status = 'unknown';
                    }
                }

                if (err) {
                    response.message = 'INFO_FORGOTPWD_PROBLEM';
                    response.status = 'danger';
                }

                MeanUser.events.publish('forgotpassword', {
                    description: req.body.text + ' forgot password.'
                });

                res.json(response);
            });
        }
    };
}


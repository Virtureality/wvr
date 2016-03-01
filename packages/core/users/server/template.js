'use strict';

module.exports = {
  forgot_password_email: function(user, req, token, mailOptions) {
    /*mailOptions.html = [
      'Hi ' + user.name + ',',
      'We have received a request to reset the password for your account.',
      'If you made this request, please click on the link below or paste this into your browser to complete the process:',
      'http://' + req.headers.host + '/reset/' + token,
      'This link will work for 1 hour before your password is reset.',
      'If you did not ask to change your password, please ignore this email and your account will remain unchanged.'
    ].join('\n\n');*/
    var resetURL = 'http://' + req.headers.host + '/reset/' + token;
    mailOptions.html = [
      '<b>Dear </b>' + user.name + ',' + '<br>',
      '<br>',
      'We have received a request to reset the password for your account.' + '<br>',
      '<br>',
      'If you made this request, please click on the link below or paste it into your browser to complete the process:' + '<br>',
      '<a href="' + resetURL + '" _target="_blank">' + resetURL + '</a>' + '<br>',
      'This link will work for 1 hour before your password is reset.',
      'If you did not ask to change your password, please ignore this email and your account will remain unchanged.' + '<br>',
      '<br>',
      'Regards,' + '<br>',
      'Edening Working Group.',
      '<br>'
    ].join('\n\n');
    mailOptions.subject = 'Resetting the password';
    return mailOptions;
  }
};

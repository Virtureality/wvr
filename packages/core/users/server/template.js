'use strict';

module.exports = {
  forgot_password_email: function(user, req, token, mailOptions) {
    var resetURL = 'http://' + req.headers.host + '/reset/' + token;
    if(mailOptions.lang === 'zh') {
      mailOptions.html = [
        '<b>尊敬的 </b>' + user.name + ':' + '<br>',
        '<br>',
        '我们收到了重置您帐户的申请。' + '<br>',
        '<br>',
        '如果是您提出的申请，请访问后面的链接完成密码重置:' + '<br>',
        '<a href="' + resetURL + '" _target="_blank">' + resetURL + '</a>' + '<br>',
        '请注意: 该链接的有效期为1小时!',
        '如果您未提出申请，请忽略此邮件!' + '<br>',
        '<br>',
        '谢谢!' + '<br>',
        '乐境',
        '<br>'
      ].join('\n\n');
      mailOptions.subject = '正在重置密码';
    } else {
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
        'Edening',
        '<br>'
      ].join('\n\n');
      mailOptions.subject = 'Resetting the password';
    }
    return mailOptions;
  }
};

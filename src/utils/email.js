const nodemailer = require('nodemailer');
const Config = require('../utils/config');

const config = new Config();

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: config.mailServer.emailHost,
    port: config.mailServer.emailPort,
    auth: {
      user: config.mailServer.emailUsername,
      pass: config.mailServer.emailPassword,
    },
  });

  const mailOptions = {
    from: 'Sellz.com <hello@loumar.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3) Actually send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

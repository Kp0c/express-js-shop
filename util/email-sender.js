const nodemailer = require("nodemailer");

let transporter = null;

const sendEmail = async (email, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject,
    html
  };

  await transporter.sendMail(mailOptions);
}

const createTransporter = () => {
  // note: this is not a real email service
  // change before moving to production
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

module.exports = {
  createTransporter,
  sendEmail
};

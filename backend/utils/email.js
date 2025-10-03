const nodemailer = require('nodemailer');

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'polarix678@gmail.com', // Replace with your email
    pass: 'zlgp purl pctd iajp'   // Use an app password if 2FA is on
  }
});

// Send Thank You Email Function
async function sendThankYouEmail(toEmail, username) {
  const mailOptions = {
    from: 'Polarix Team <polarix678@gmail.com>',
    to: toEmail,
    subject: '🎉 Welcome to Polarix!',
    text: `Hi ${username},\n\nThank you for registering at Polarix. We're thrilled to have you on board! 🚀\n\nBest Regards,\nThe Polarix Team`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return false;
  }
}

module.exports = {
  sendThankYouEmail,
  transporter
};
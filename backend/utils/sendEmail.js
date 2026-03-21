const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Inventory Management System" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email}`);
  } catch (error) {
    console.error('--- EMAIL SENDING FAILED (SMTP ERROR) ---');
    console.error('Error:', error.message);
    console.log('--- DEVELOPMENT FALLBACK: EMAIL CONTENT ---');
    console.log('To:', options.email);
    console.log('Subject:', options.subject);
    console.log('HTML Content:', options.html);
    console.log('------------------------------------------');
    
    throw error;
  }
};

module.exports = sendEmail;

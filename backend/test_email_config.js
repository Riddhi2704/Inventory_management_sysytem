const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  console.log('Testing email configuration...');
  console.log('User:', process.env.EMAIL_USER);
  console.log('Pass:', process.env.EMAIL_PASS ? '******** (masked)' : 'MISSING');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || process.env.EMAIL_PASS === 'your_16_letter_app_password') {
    console.error('\nERROR: Email credentials are not configured correctly in .env');
    console.error('Please update EMAIL_PASS with a valid 16-character Google App Password.');
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Test Service" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER, // Send to self
    subject: 'Email Configuration Test',
    text: 'If you are reading this, your email configuration for the Inventory Management System is working correctly!',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('\nSUCCESS: Email sent successfully!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('\nFAILURE: Could not send email.');
    console.error('Error details:', error.message);
    if (error.code === 'EAUTH') {
        console.error('\nSuggestion: This is an Authentication error. Double-check your App Password.');
    }
  }
}

testEmail();

require('dotenv').config();
const { sendMail, isMailerConfigured } = require('../src/lib/mailer');

async function testEmail() {
  console.log('--- Mailer Test ---');
  console.log('Is mailer configured?', isMailerConfigured());
  
  if (!isMailerConfigured()) {
    console.error('Mailer is not configured correctly in .env');
    return;
  }

  try {
    console.log('Sending test email to info.bookmyvibe@gmail.com...');
    const result = await sendMail({
      to: 'info.bookmyvibe@gmail.com',
      subject: 'Nodemailer Test - Book & Vibe',
      text: 'This is a test email to verify that Nodemailer is working correctly.',
      html: '<h1>Nodemailer Test</h1><p>This is a test email to verify that Nodemailer is working correctly.</p>'
    });
    
    console.log('Result:', result);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

testEmail();

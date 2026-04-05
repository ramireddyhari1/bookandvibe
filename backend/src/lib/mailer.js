const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
const SMTP_SECURE = String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

function isMailerConfigured() {
  return Boolean(SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS && SMTP_FROM);
}

const transporter = isMailerConfigured()
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

async function sendMail({ to, subject, text, html }) {
  if (!to || !subject) {
    throw new Error('Mail recipient and subject are required');
  }

  if (!transporter) {
    return {
      skipped: true,
      message: 'SMTP mailer is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.',
    };
  }

  const result = await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    text: text || undefined,
    html: html || undefined,
  });

  return {
    skipped: false,
    messageId: result.messageId,
  };
}

module.exports = {
  isMailerConfigured,
  sendMail,
};
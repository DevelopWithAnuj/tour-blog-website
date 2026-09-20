import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';

const getProductLink = () => {
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL;
  if (process.env.SERVER_URL) return process.env.SERVER_URL;
  if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*') {
    return process.env.CORS_ORIGIN.split(',')[0];
  }

  return 'http://localhost:3000';
};

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: Number(process.env.MAILTRAP_SMTP_PORT) || 2525,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });
};

const sendEmail = async ({ email, subject, mailgenContent }) => {
  if (!email || !subject || !mailgenContent) {
    throw new Error('email, subject and mailgenContent are required');
  }

  const mailGenerator = new Mailgen({
    theme: 'default',
    product: {
      name: 'Drimora Travel',
      link: getProductLink(),
    },
  });

  const emailTextual = mailGenerator.generatePlaintext(mailgenContent);
  const emailHTML = mailGenerator.generate(mailgenContent);

  const transporter = createTransporter();

  const mail = {
    from: process.env.MAIL_FROM || '"Drimora Travel" <no-reply@drimora.com>',
    to: email,
    subject,
    text: emailTextual,
    html: emailHTML,
  };

  return await transporter.sendMail(mail);
};

const emailVerificationMailgenContent = (username, verificationUrl) => ({
  body: {
    name: username,
    intro:
      'Welcome to Drimora Travel. Please verify your email address to activate your account.',
    action: {
      instructions: 'Click the button below to verify your email:',
      button: {
        color: '#22BC66',
        text: 'Verify Email',
        link: verificationUrl,
      },
    },
    outro:
      'If you did not create this account, you can safely ignore this email.',
  },
});

const forgotPasswordMailgenContent = (username, passwordResetUrl) => ({
  body: {
    name: username,
    intro:
      'We received a request to reset your Drimora Travel account password.',
    action: {
      instructions: 'Click the button below to reset your password:',
      button: {
        color: '#DC4D2F',
        text: 'Reset Password',
        link: passwordResetUrl,
      },
    },
    outro:
      'This link will expire soon. If you did not request a password reset, you can ignore this email.',
  },
});

export {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
};

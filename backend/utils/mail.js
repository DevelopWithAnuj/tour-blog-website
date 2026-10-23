import Mailgen from 'mailgen';
import nodemailer from 'nodemailer';
import { Config } from './constants.js';
import { unsubscribe } from 'diagnostics_channel';

const getProductLink = () => {
  if (process.env.CLIENT_URL) return process.env.CLIENT_URL;
  if (process.env.SERVER_URL) return process.env.SERVER_URL;
  if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN !== '*') {
    return process.env.CORS_ORIGIN.split(',')[0];
  }

  return `${Config.SERVER_URL}`;
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

const sendEmail = async ({ email, subject, mailgenContent, headers }) => {
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
    ...Config(headers ? {headers} : {}),
  };

  return await transporter.sendMail(mail);
};

const newsletterMailgenContent = (message, unsubscribeUrl) => ({
  body: {
    intro: message
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean),
    outro: `You are receiving this because you joined the Drimora trip-ideas list. Unsubscribe any time: ${unsubscribeUrl}`,
  },
});

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

const bookingConfirmationMailgenContent = (booking, tourTitle, bookingRef) => ({
  body: {
    name: booking.travelerName,
    intro: `Your booking for ${tourTitle} is confirmed. Thank you for choosing Drimora Travel.`,
    table: {
      data: [
        { item: 'Booking ID', details: bookingRef },
        { item: 'Tour', details: tourTitle },
        {
          item: 'Travel date',
          details: booking.date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        },
        { item: 'Travellers', details: String(booking.guestCount) },
        {
          item: 'Total paid',
          details: `₹${booking.totalAmount.toLocaleString('en-IN')}`,
        },
      ],
    },
    outro:
      'You can view or cancel this booking from your dashboard. Need help? Just reply to this email.',
  },
});

export {
  bookingConfirmationMailgenContent,
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  newsletterMailgenContent,
  sendEmail,
};

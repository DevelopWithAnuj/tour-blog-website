import crypto from 'crypto';
import { asyncHandler } from '../utils/async-handler.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { HttpStatus } from '../utils/constants.js';
import { Subscriber } from '../models/Subscriber.models.js';
import { newsletterMailgenContent, sendEmail } from '../utils/mail.js';
import logger from '../config/logger.js';

const SEND_DELAY_MS = Number(process.env.NEWSLETTER_SEND_DELAY_MS) || 250;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';

const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    // Idempotent and identical response either way, so it can't be used
    // to find out who is already subscribed.
    await Subscriber.updateOne(
      { email },
      { $setOnInsert: { email }, $set: { unsubscribedAt: null } },
      { upsert: true }
    );
  } catch (err) {
    if (err.code !== 11000) throw err;
  }
  res
    .status(HttpStatus.CREATED)
    .json(
      new ApiResponse(HttpStatus.CREATED, {}, 'Thanks, you are on the list.')
    );
});

const unsubscribe = asyncHandler(async (req, res) => {
  const result = await Subscriber.updateOne(
    { unsubscribeToken: String(req.params.token) },
    { $set: { unsubscribedAt: new Date() } }
  );
  if (!result.matchedCount) {
    throw new ApiError(
      HttpStatus.NOT_FOUND,
      'This unsubscribe link is not valid.'
    );
  }
  res
    .status(HttpStatus.OK)
    .json(new ApiResponse(HttpStatus.OK, {}, 'You have been unsubscribed.'));
});

const getNewsletterStats = asyncHandler(async (req, res) => {
  const subscribers = await Subscriber.countDocuments({ unsubscribedAt: null });
  res
    .status(HttpStatus.OK)
    .json(
      new ApiResponse(
        HttpStatus.OK,
        { subscribers },
        'Newsletter stats fetched'
      )
    );
});

const deliver = async (recipients, subject, message) => {
  let sent = 0;
  let failed = 0;
  for (const r of recipients) {
    try {
      let token = r.unsubscribeToken;
      if (!token) {
        token = crypto.randomBytes(16).toString('hex');
        await Subscriber.updateOne(
          { _id: r._id },
          { $set: { unsubscribeToken: token } }
        );
      }
      const url = `${clientUrl()}/unsubscribe/${token}`;
      await sendEmail({
        email: r.email,
        subject,
        mailgenContent: newsletterMailgenContent(message, url),
        headers: { 'List-Unsubscribe': `<${url}>` },
      });
      sent++;
    } catch (err) {
      failed++;
      logger.error(`Newsletter to ${r._id} failed: ${err.message}`);
    }
    await sleep(SEND_DELAY_MS);
  }
  logger.info(
    `Newsletter "${subject}" finished: ${sent} sent, ${failed} failed`
  );
};

const sendNewsletter = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  const recipients = await Subscriber.find({ unsubscribedAt: null }).lean();
  if (!recipients.length) {
    throw new ApiError(HttpStatus.CONFLICT, 'There are no subscribers yet.');
  }
  res
    .status(HttpStatus.ACCEPTED)
    .json(
      new ApiResponse(
        HttpStatus.ACCEPTED,
        { recipients: recipients.length },
        `Sending to ${recipients.length} subscribers`
      )
    );

  deliver(recipients, subject, message).catch((err) =>
    logger.error(`Newsletter run crashed: ${err.message}`)
  );
});

export { subscribe, unsubscribe, getNewsletterStats, sendNewsletter };

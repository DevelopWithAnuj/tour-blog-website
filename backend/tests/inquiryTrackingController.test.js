import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import {
  createInquiry,
  getInquiryByTrackingToken,
  getMyInquiries,
  hashTrackingToken,
} from '../controllers/contact.Controller.js';
import { updateInquiryStatus } from '../controllers/admin.Controller.js';
import { Inquiry } from '../models/Inquiry.models.js';

const invoke = (handler, req) =>
  new Promise((resolve, reject) => {
    let statusCode;
    handler(
      req,
      {
        status(code) {
          statusCode = code;
          return this;
        },
        json(body) {
          resolve({ statusCode, body });
        },
      },
      reject
    );
  });

const inquiryRequest = (extra = {}) => ({
  body: {
    name: 'A Traveler',
    email: 'traveler@example.com',
    subject: 'Help with my trip',
    message: 'I need some help with an upcoming trip.',
    ...extra,
  },
});

test('creates guest inquiries with a hashed token and emails the private link', async (t) => {
  let savedInquiry;
  let sentMail;
  t.mock.method(Inquiry, 'countDocuments', async () => 0);
  t.mock.method(Inquiry, 'create', async (values) => {
    savedInquiry = { ...values, _id: new mongoose.Types.ObjectId() };
    return savedInquiry;
  });
  t.mock.method(nodemailer, 'createTransport', () => ({
    sendMail: async (mail) => {
      sentMail = mail;
      return {};
    },
  }));

  const { statusCode, body } = await invoke(createInquiry, inquiryRequest());
  const token = sentMail.html.match(/\/inquiry-tracker\/([a-f0-9]{64})/)?.[1];

  assert.equal(statusCode, 201);
  assert.equal(body.data.trackingByEmail, true);
  assert.match(body.message, /sent a private tracking link/i);
  assert.ok(token);
  assert.equal(savedInquiry.trackingTokenHash, hashTrackingToken(token));
  assert.equal(JSON.stringify(savedInquiry).includes(token), false);
  assert.equal(savedInquiry.statusHistory[0].status, 'new');
});

test('reports guest inquiry receipt without claiming a failed tracking email was sent', async (t) => {
  t.mock.method(Inquiry, 'create', async (values) => ({
    ...values,
    _id: new mongoose.Types.ObjectId(),
  }));
  t.mock.method(nodemailer, 'createTransport', () => ({
    sendMail: async () => {
      throw new Error('mail server unavailable');
    },
  }));
  t.mock.method(Inquiry, 'countDocuments', async () => 0);

  const { statusCode, body } = await invoke(createInquiry, inquiryRequest());

  assert.equal(statusCode, 201);
  assert.equal(body.data.trackingByEmail, false);
  assert.match(body.message, /could not email your private tracking link/i);
});

test('does not email a tracking link once the address hit its daily cap', async (t) => {
  let created;
  let mailed = false;
  let countFilter;
  t.mock.method(Inquiry, 'countDocuments', async (filter) => {
    countFilter = filter;
    return 3;
  });
  t.mock.method(Inquiry, 'create', async (values) => {
    created = values;
    return { ...values, _id: new mongoose.Types.ObjectId() };
  });
  t.mock.method(nodemailer, 'createTransport', () => ({
    sendMail: async () => {
      mailed = true;
      return {};
    },
  }));

  const { statusCode, body } = await invoke(
    createInquiry,
    inquiryRequest({ email: 'Traveler@Example.com' })
  );

  assert.equal(statusCode, 201);
  assert.equal(mailed, false);
  assert.equal(created.trackingTokenHash, undefined);
  assert.equal(countFilter.email, 'traveler@example.com');
  assert.deepEqual(countFilter.user, { $exists: false });
  assert.equal(body.data.trackingByEmail, false);
  assert.match(body.message, /could not email your private tracking link/i);
});

test('lists only the authenticated user inquiries and excludes tracking credentials', async (t) => {
  const userId = new mongoose.Types.ObjectId();
  const inquiries = [{ subject: 'Help', status: 'under_review' }];
  let query;
  t.mock.method(Inquiry, 'find', (filter) => {
    query = filter;
    return {
      select(fields) {
        assert.equal(
          fields,
          'subject message type status statusHistory createdAt updatedAt'
        );
        return {
          sort: async (sort) => {
            assert.deepEqual(sort, { createdAt: -1 });
            return inquiries;
          },
        };
      },
    };
  });

  const { statusCode, body } = await invoke(getMyInquiries, {
    user: { _id: userId },
  });

  assert.equal(statusCode, 200);
  assert.deepEqual(query, { user: userId });
  assert.deepEqual(body.data.inquiries, inquiries);
});

test('looks up guest inquiries by hashed token and checks token expiry', async (t) => {
  const token = 'a'.repeat(64);
  const inquiry = { subject: 'Help', status: 'new', statusHistory: [] };
  let query;
  t.mock.method(Inquiry, 'findOne', (filter) => {
    query = filter;
    return {
      select: async (fields) => {
        assert.equal(
          fields,
          'subject message type status statusHistory createdAt updatedAt'
        );
        return inquiry;
      },
    };
  });

  const { statusCode, body } = await invoke(getInquiryByTrackingToken, {
    params: { token },
  });

  assert.equal(statusCode, 200);
  assert.equal(query.trackingTokenHash, hashTrackingToken(token));
  assert.ok(query.trackingTokenExpiresAt.$gt instanceof Date);
  assert.deepEqual(body.data.inquiry, inquiry);
});

test('rejects an invalid or expired guest tracking link', async (t) => {
  t.mock.method(Inquiry, 'findOne', () => ({
    select: async () => null,
  }));

  await assert.rejects(
    invoke(getInquiryByTrackingToken, {
      params: { token: 'b'.repeat(64) },
    }),
    (error) => {
      assert.equal(error.statusCode, 404);
      assert.match(error.message, /invalid or expired/i);
      return true;
    }
  );
});

test('records resolution messages and notifies the inquiry sender', async (t) => {
  const inquiry = {
    _id: new mongoose.Types.ObjectId(),
    name: 'A Traveler',
    email: 'traveler@example.com',
    subject: 'Help with my trip',
    status: 'under_review',
    statusHistory: [{ status: 'new', message: '' }],
    save: async () => {},
  };
  let sentMail;
  t.mock.method(Inquiry, 'findById', async () => inquiry);
  t.mock.method(nodemailer, 'createTransport', () => ({
    sendMail: async (mail) => {
      sentMail = mail;
      return {};
    },
  }));

  const { statusCode, body } = await invoke(updateInquiryStatus, {
    params: { id: String(inquiry._id) },
    body: {
      status: 'resolved',
      resolutionMessage: 'Your booking has now been corrected.',
    },
  });

  assert.equal(statusCode, 200);
  assert.equal(inquiry.status, 'resolved');
  assert.equal(
    inquiry.statusHistory.at(-1).message,
    'Your booking has now been corrected.'
  );
  assert.equal(body.data.notificationSent, true);
  assert.match(sentMail.text, /Your booking has now been corrected/);
});

test('requires review before resolution and requires a resolution message', async (t) => {
  const inquiry = {
    _id: new mongoose.Types.ObjectId(),
    status: 'new',
    statusHistory: [],
    save: async () => {
      throw new Error('Invalid transitions must not be saved');
    },
  };
  t.mock.method(Inquiry, 'findById', async () => inquiry);

  await assert.rejects(
    invoke(updateInquiryStatus, {
      params: { id: String(inquiry._id) },
      body: { status: 'resolved', resolutionMessage: 'Fixed it.' },
    }),
    (error) => {
      assert.equal(error.statusCode, 400);
      assert.match(error.message, /cannot move from new to resolved/i);
      return true;
    }
  );

  inquiry.status = 'under_review';
  await assert.rejects(
    invoke(updateInquiryStatus, {
      params: { id: String(inquiry._id) },
      body: { status: 'resolved', resolutionMessage: '  ' },
    }),
    (error) => {
      assert.equal(error.statusCode, 400);
      assert.match(error.message, /resolution message/i);
      return true;
    }
  );
});

import assert from 'node:assert/strict';
import test from 'node:test';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import { Booking } from '../models/Booking.models.js';
import { Tour } from '../models/Tour.models.js';
import {
  cancelBooking,
  createBooking,
  payBooking,
} from '../controllers/booking.Controller.js';

const futureDate = (days = 60) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

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

const bookingRequest = (userId, extra = {}) => ({
  user: { _id: userId },
  params: { id: new mongoose.Types.ObjectId().toString() },
  body: extra,
});

const mockBookingLookup = (t, booking) => {
  t.mock.method(Booking, 'findById', () => ({
    populate: async () => booking,
  }));
};

test('creates bookings on an explicitly available tour date', async (t) => {
  const date = futureDate();
  const tour = {
    _id: new mongoose.Types.ObjectId(),
    price: 125,
    availableDates: [new Date(`${date}T00:00:00.000Z`)],
  };
  const create = t.mock.method(Booking, 'create', async (values) => values);
  t.mock.method(Tour, 'findOne', async () => tour);

  const { statusCode, body } = await invoke(
    createBooking,
    bookingRequest(new mongoose.Types.ObjectId().toString(), {
      tourId: tour._id,
      date,
      guestCount: 2,
      travelerName: 'A Traveler',
      travelerEmail: 'traveler@example.com',
    })
  );

  assert.equal(statusCode, 201);
  assert.equal(body.data.booking.totalAmount, 250);
  assert.equal(body.data.booking.tour, tour._id);
  assert.equal(create.mock.callCount(), 1);
});

test('rejects booking dates not listed for a tour with configured dates', async (t) => {
  const date = futureDate(65);
  const tour = {
    _id: new mongoose.Types.ObjectId(),
    price: 125,
    availableDates: [new Date(`${futureDate(60)}T00:00:00.000Z`)],
  };
  const create = t.mock.method(Booking, 'create', async (values) => values);
  t.mock.method(Tour, 'findOne', async () => tour);

  await assert.rejects(
    invoke(
      createBooking,
      bookingRequest(new mongoose.Types.ObjectId().toString(), {
        tourId: tour._id,
        date,
        guestCount: 1,
        travelerName: 'A Traveler',
        travelerEmail: 'traveler@example.com',
      })
    ),
    (error) => {
      assert.equal(error.statusCode, 409);
      assert.match(error.message, /not available on the selected date/i);
      return true;
    }
  );
  assert.equal(create.mock.callCount(), 0);
});

test('keeps future booking dates open when a tour has no configured dates', async (t) => {
  const date = futureDate();
  const tour = {
    _id: new mongoose.Types.ObjectId(),
    price: 125,
    availableDates: [],
  };
  t.mock.method(Tour, 'findOne', async () => tour);
  t.mock.method(Booking, 'create', async (values) => values);

  const { statusCode } = await invoke(
    createBooking,
    bookingRequest(new mongoose.Types.ObjectId().toString(), {
      tourId: tour._id,
      date,
      guestCount: 1,
      travelerName: 'A Traveler',
      travelerEmail: 'traveler@example.com',
    })
  );

  assert.equal(statusCode, 201);
});

test('marks successful payments paid and confirms the booking', async (t) => {
  const userId = new mongoose.Types.ObjectId().toString();
  const booking = {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    tour: { title: 'Coastal Escape' },
    date: new Date(futureDate()),
    travelerName: 'A Traveler',
    travelerEmail: 'traveler@example.com',
    guestCount: 1,
    totalAmount: 125,
    paymentStatus: 'unpaid',
    status: 'pending',
    save: async () => {},
  };
  mockBookingLookup(t, booking);
  t.mock.method(nodemailer, 'createTransport', () => ({
    sendMail: async () => ({}),
  }));

  const { statusCode, body } = await invoke(
    payBooking,
    bookingRequest(userId, { method: 'upi' })
  );

  assert.equal(statusCode, 200);
  assert.equal(body.data.booking.paymentStatus, 'paid');
  assert.equal(body.data.booking.status, 'confirmed');
  assert.ok(body.data.booking.paidAt instanceof Date);
});

test('marks a declined card payment as failed and returns an error', async (t) => {
  const userId = new mongoose.Types.ObjectId().toString();
  let saved = false;
  const booking = {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    paymentStatus: 'unpaid',
    status: 'pending',
    save: async () => {
      saved = true;
    },
  };
  mockBookingLookup(t, booking);

  await assert.rejects(
    invoke(
      payBooking,
      bookingRequest(userId, { method: 'card', cardNumber: '1234567812340000' })
    ),
    (error) => {
      assert.equal(error.statusCode, 422);
      assert.equal(booking.paymentStatus, 'failed');
      return true;
    }
  );
  assert.equal(saved, true);
});

test('cancels unpaid bookings without changing payment status', async (t) => {
  const userId = new mongoose.Types.ObjectId().toString();
  const booking = {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    status: 'pending',
    paymentStatus: 'unpaid',
    save: async () => {},
  };
  mockBookingLookup(t, booking);

  const { statusCode, body } = await invoke(
    cancelBooking,
    bookingRequest(userId)
  );

  assert.equal(statusCode, 200);
  assert.equal(body.data.booking.status, 'cancelled');
  assert.equal(body.data.booking.paymentStatus, 'unpaid');
  assert.ok(body.data.booking.cancelledAt instanceof Date);
});

test('cancels a paid booking within the free cancellation window', async (t) => {
  const userId = new mongoose.Types.ObjectId().toString();
  const booking = {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    status: 'confirmed',
    paymentStatus: 'paid',
    canCancel: true,
    save: async () => {},
  };
  mockBookingLookup(t, booking);

  const { statusCode, body } = await invoke(
    cancelBooking,
    bookingRequest(userId)
  );

  assert.equal(statusCode, 200);
  assert.equal(body.data.booking.status, 'cancelled');
  assert.equal(body.data.booking.paymentStatus, 'refunded');
});

test('does not cancel a paid booking after the cancellation window closes', async (t) => {
  const userId = new mongoose.Types.ObjectId().toString();
  const booking = {
    _id: new mongoose.Types.ObjectId(),
    user: userId,
    status: 'confirmed',
    paymentStatus: 'paid',
    canCancel: false,
    save: async () => {
      throw new Error('A closed-window booking must not be saved');
    },
  };
  mockBookingLookup(t, booking);

  await assert.rejects(
    invoke(cancelBooking, bookingRequest(userId)),
    (error) => {
      assert.equal(error.statusCode, 409);
      assert.match(error.message, /cancellation window has closed/i);
      return true;
    }
  );
  assert.equal(booking.status, 'confirmed');
  assert.equal(booking.paymentStatus, 'paid');
});

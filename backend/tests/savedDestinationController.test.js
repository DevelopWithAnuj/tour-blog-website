import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getSavedDestinations,
  removeSavedDestination,
  saveDestination,
} from '../controllers/savedDestination.Controller.js';
import { Tour } from '../models/Tour.models.js';

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

test('returns saved destinations for the signed-in user', async () => {
  const { statusCode, body } = await invoke(getSavedDestinations, {
    user: { savedDestinations: ['Japan', 'Bali'] },
  });

  assert.equal(statusCode, 200);
  assert.deepEqual(body.data.savedDestinations, ['Japan', 'Bali']);
});

test('saves the canonical name of an active tour destination', async (t) => {
  t.mock.method(Tour, 'findOne', () => ({
    select: async () => ({ destination: 'Japan' }),
  }));
  let saveCount = 0;
  const user = {
    savedDestinations: [],
    save: async () => {
      saveCount += 1;
    },
  };

  const { statusCode, body } = await invoke(saveDestination, {
    user,
    body: { destination: ' japan ' },
  });

  assert.equal(statusCode, 200);
  assert.deepEqual(body.data.savedDestinations, ['Japan']);
  assert.equal(saveCount, 1);
});

test('does not duplicate an already saved destination', async (t) => {
  t.mock.method(Tour, 'findOne', () => ({
    select: async () => ({ destination: 'Japan' }),
  }));
  const user = {
    savedDestinations: ['Japan'],
    save: async () => {
      assert.fail('An existing destination should not be saved again');
    },
  };

  const { statusCode, body } = await invoke(saveDestination, {
    user,
    body: { destination: 'Japan' },
  });

  assert.equal(statusCode, 200);
  assert.deepEqual(body.data.savedDestinations, ['Japan']);
});

test('removes a saved destination without case-sensitive matching', async () => {
  let saveCount = 0;
  const user = {
    savedDestinations: ['Japan', 'Bali'],
    save: async () => {
      saveCount += 1;
    },
  };

  const { statusCode, body } = await invoke(removeSavedDestination, {
    user,
    body: { destination: 'jApAn' },
  });

  assert.equal(statusCode, 200);
  assert.deepEqual(body.data.savedDestinations, ['Bali']);
  assert.equal(saveCount, 1);
});

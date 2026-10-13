import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../worker/index.js';

test('contact defaults to an empty placeholder, not a fabricated email', async () => {
  const response = await worker.fetch(new Request('https://example.com/api/config'), {});
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { contactEmail: '' });
  assert.equal(response.headers.get('Cache-Control'), 'no-store');
});

test('configured public contact email is trimmed and returned', async () => {
  const response = await worker.fetch(new Request('https://example.com/api/config'), {
    CONTACT_EMAIL: ' mary@example.com ',
  });
  assert.deepEqual(await response.json(), { contactEmail: 'mary@example.com' });
});

test('invalid contact configuration stays unavailable', async () => {
  for (const contactEmail of ['not-an-email', 'mary@example.com\r\nBcc: spam@example.com', 123]) {
    const response = await worker.fetch(new Request('https://example.com/api/config'), {
      CONTACT_EMAIL: contactEmail,
    });
    assert.deepEqual(await response.json(), { contactEmail: '' });
  }
});

test('config rejects post requests without accepting messages', async () => {
  const response = await worker.fetch(new Request('https://example.com/api/config', { method: 'POST' }), {});
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('Allow'), 'GET');
});

test('unknown API endpoints return a genuine 404', async () => {
  const response = await worker.fetch(new Request('https://example.com/api/missing'), {});
  assert.equal(response.status, 404);
});

test('non-API routes delegate to Cloudflare static assets', async () => {
  const request = new Request('https://example.com/');
  const response = await worker.fetch(request, {
    ASSETS: { fetch: async (assetRequest) => {
      assert.equal(assetRequest, request);
      return new Response('Shermanator LLC');
    } },
  });
  assert.equal(await response.text(), 'Shermanator LLC');
});
import assert from 'node:assert/strict';
import test from 'node:test';
import { createInquiry, createMailto } from '../src/inquiry.js';

const values = { name: ' Alex Client ', email: ' alex@example.com ', organization: ' Example Org ', service: 'Compliance & grant support', message: ' Help with our program. ' };

test('inquiry includes trimmed identity, service, and message', () => {
  const inquiry = createInquiry(values);
  assert.equal(inquiry.subject, 'Shermanator inquiry: Compliance & grant support');
  assert.ok(inquiry.body.includes('Organization: Example Org'));
  assert.ok(inquiry.body.endsWith('Alex Client\nalex@example.com'));
  assert.ok(inquiry.body.includes('\nHelp with our program.\n'));
});

test('optional organization is omitted when empty', () => {
  const inquiry = createInquiry({ ...values, organization: '  ' });
  assert.ok(!inquiry.body.includes('Organization:'));
});

test('email draft encodes reserved characters instead of creating extra mailto fields', () => {
  const inquiry = createInquiry({ ...values, message: 'Budget & staffing? #next\nBcc: not-a-recipient@example.com' });
  const mailto = createMailto('mary@example.com', inquiry);
  const url = new URL(mailto);
  assert.equal(decodeURIComponent(url.pathname), 'mary@example.com');
  assert.equal(url.searchParams.get('subject'), inquiry.subject);
  assert.equal(url.searchParams.get('body'), inquiry.body);
  assert.equal(url.searchParams.size, 2);
});
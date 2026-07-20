import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertTicketAvailability,
  calculateOrderTotal,
  progressPercent,
  remainingTickets,
  slugify,
  squadCode,
  ticketCodes,
} from '../src/services/dunda.service.js';

test('slugify creates a clean event URL slug', () => {
  assert.equal(slugify('  Afro Sunset — Nairobi!  '), 'afro-sunset-nairobi');
});

test('ticket checkout adds the configured service fee', () => {
  assert.deepEqual(calculateOrderTotal(1000, 2, 0.05), {
    unitAmount: 1000,
    quantity: 2,
    subtotal: 2000,
    serviceFee: 100,
    total: 2100,
  });
});

test('gift checkout can use a lower service fee', () => {
  assert.equal(calculateOrderTotal(5000, 1, 0.03).total, 5150);
});

test('checkout quantity is bounded to twenty tickets', () => {
  assert.equal(calculateOrderTotal(100, 99).quantity, 20);
});

test('remaining ticket inventory never becomes negative', () => {
  assert.equal(remainingTickets({ quantity: 20, sold: 25 }), 0);
});

test('availability blocks overselling', () => {
  assert.throws(
    () => assertTicketAvailability({ active: true, quantity: 10, sold: 9 }, 2),
    /Only 1 ticket\(s\) remain/
  );
});

test('ticket codes are unique and correctly prefixed', () => {
  const codes = ticketCodes(10);
  assert.equal(codes.length, 10);
  assert.equal(new Set(codes).size, 10);
  assert.ok(codes.every((code) => code.startsWith('TIX-')));
});

test('squad codes are shareable and recognisable', () => {
  assert.match(squadCode('Team Rongai'), /^TEAMR-[A-F0-9]{4}$/);
});

test('Dunda progress is capped at one hundred percent', () => {
  assert.equal(progressPercent(750, 500), 100);
  assert.equal(progressPercent(250, 500), 50);
  assert.equal(progressPercent(10, 0), 0);
});

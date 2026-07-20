import crypto from 'crypto';

export function slugify(value = '') {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
}

export function shortCode(prefix = 'DND') {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${random}`;
}

export function paymentReference() {
  return shortCode('PAY');
}

export function squadCode(name = 'SQUAD') {
  const base = slugify(name).replace(/-/g, '').slice(0, 5).toUpperCase() || 'SQUAD';
  return `${base}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
}

export function ticketCodes(quantity = 1) {
  const safeQuantity = Math.min(Math.max(Number(quantity) || 1, 1), 20);
  return Array.from({ length: safeQuantity }, () => shortCode('TIX'));
}

export function calculateOrderTotal(unitAmount, quantity = 1, serviceRate = 0.05) {
  const unit = Math.max(Number(unitAmount) || 0, 0);
  const qty = Math.min(Math.max(Number(quantity) || 1, 1), 20);
  const subtotal = Math.round(unit * qty);
  const serviceFee = Math.round(subtotal * serviceRate);
  return { unitAmount: unit, quantity: qty, subtotal, serviceFee, total: subtotal + serviceFee };
}

export function remainingTickets(tier) {
  return Math.max((Number(tier?.quantity) || 0) - (Number(tier?.sold) || 0), 0);
}

export function assertTicketAvailability(tier, quantity) {
  const remaining = remainingTickets(tier);
  if (!tier || tier.active === false) {
    const error = new Error('This ticket tier is not available.');
    error.status = 400;
    throw error;
  }
  if (remaining < quantity) {
    const error = new Error(`Only ${remaining} ticket(s) remain in this tier.`);
    error.status = 409;
    throw error;
  }
}

export function progressPercent(current, target) {
  if (!target || target <= 0) return 0;
  return Math.min(Math.round((Number(current || 0) / Number(target)) * 100), 100);
}

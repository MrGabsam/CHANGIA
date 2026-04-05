export function calculateRisk(entry, allEntries = []) {
  const code = String(entry.transactionCode || '').trim().toUpperCase();
  const duplicates = code
    ? allEntries.filter((item) => String(item.transactionCode || '').trim().toUpperCase() === code).length
    : 0;

  if (duplicates > 1) return 'Red';
  if (!entry.proofUrl || !entry.transactionCode || entry.paymentMethod === 'Bank') return 'Yellow';
  return 'Green';
}

export function createTicketCode(name = 'GUEST') {
  const prefix = name.split(' ')[0].slice(0, 4).toUpperCase() || 'GUEST';
  return `QR-${prefix}-${Date.now().toString().slice(-5)}`;
}

export function kes(value) {
  return `KSh ${Number(value || 0).toLocaleString()}`;
}

export function statusClass(status) {
  if (status === 'Verified') return 'badge badge-green';
  if (status === 'Pending') return 'badge badge-yellow';
  return 'badge badge-red';
}

export function riskClass(risk) {
  if (risk === 'Green') return 'badge badge-green';
  if (risk === 'Yellow') return 'badge badge-yellow';
  return 'badge badge-red';
}

export function formatNis(value: string | number): string {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (!isFinite(num)) return `0₪`;
  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(num));
  return `${formatted}₪`;
}



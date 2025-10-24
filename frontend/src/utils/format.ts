export function formatNis(value: string | number): string {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (!isFinite(num)) return `0₪`;
  const formatted = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Math.round(num));
  return `${formatted}₪`;
}

/**
 * Format phone number for display
 * Converts "+972501234567" to "050-123-4567"
 * Or displays as-is if not Israeli format
 */
export function formatPhoneDisplay(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Check if it's Israeli format (starts with 972)
  if (digits.startsWith('972') && digits.length === 12) {
    // Extract the local number (remove country code)
    const localNumber = digits.slice(3);
    // Format as XXX-XXX-XXXX
    return `${localNumber.slice(0, 3)}-${localNumber.slice(3, 6)}-${localNumber.slice(6)}`;
  }

  // Check if it's already in local format (10 digits starting with 0)
  if (digits.startsWith('0') && digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Return as-is for other formats
  return phone;
}

/**
 * Normalize phone number for storage
 * Adds +972 prefix if Israeli number is detected
 * Otherwise stores as entered
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // If it starts with 0 and has 10 digits, it's Israeli local format
  if (digits.startsWith('0') && digits.length === 10) {
    // Replace leading 0 with 972
    return `+972${digits.slice(1)}`;
  }

  // If it starts with 972 and has 12 digits, add + prefix
  if (digits.startsWith('972') && digits.length === 12) {
    return `+${digits}`;
  }

  // Return with + prefix if it doesn't have one
  if (phone.startsWith('+')) {
    return phone;
  }

  return `+${digits}`;
}

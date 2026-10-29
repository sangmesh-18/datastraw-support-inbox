/**
 * Validation and ID generation helpers
 */

export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  // Standard RFC 5322 compatible regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidPassword(password) {
  if (!password || typeof password !== 'string') return false;
  // Backend requires >= 8 characters
  return password.length >= 8;
}

export function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments lacking crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}


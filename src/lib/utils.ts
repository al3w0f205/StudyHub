/**
 * Check if a user's subscription is currently active
 * @param {Date|string|null} subscriptionExpiry
 * @returns {boolean}
 */
export function isSubscriptionActive(
  subscriptionExpiry: Date | string | null
): boolean {
  if (!subscriptionExpiry) return false;
  return new Date(subscriptionExpiry) > new Date();
}

/**
 * Format a date to a localized string
 * @param {Date|string} date
 * @param {string} locale
 * @returns {string}
 */
export function formatDate(date: Date | string, locale = "es-ES"): string {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format a date with time
 * @param {Date|string} date
 * @param {string} locale
 * @returns {string}
 */
export function formatDateTime(date: Date | string, locale = "es-ES"): string {
  return new Date(date).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Generate a URL-friendly slug from a string
 * @param {string} text
 * @returns {string}
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}

/**
 * Calculate days remaining for a subscription
 * @param {Date|string|null} subscriptionExpiry
 * @returns {number}
 */
export function daysRemaining(subscriptionExpiry: Date | string | null): number {
  if (!subscriptionExpiry) return 0;
  const diff =
    new Date(subscriptionExpiry).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Truncate text to a maximum length
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export function truncate(text: string, maxLength = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}

/**
 * Classname merge utility (simple version)
 * @param  {...string} classes
 * @returns {string}
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

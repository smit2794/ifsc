// src/utils/dateHelpers.ts

export const minutesAgo = (n: number) => new Date(Date.now() - n * 60_000);
export const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000);
export const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
export const daysFromNow = (n: number) => new Date(Date.now() + n * 86_400_000);

/**
 * Returns the next 30 September at or after today
 */
export function nextSep30(): Date {
  const now = new Date();
  const thisYearSep30 = new Date(now.getFullYear(), 8, 30, 23, 59, 59); // month 8 = September
  return thisYearSep30 > now
    ? thisYearSep30
    : new Date(now.getFullYear() + 1, 8, 30, 23, 59, 59);
}

/**
 * Format a Date in IST using Intl.DateTimeFormat
 */
export function formatIST(date: Date | string | number, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    ...opts,
  }).format(d);
}

/**
 * Format standard DD MMM YYYY in IST
 */
export function formatDateIST(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Format standard HH:mm:ss IST
 */
export function formatTimeIST(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(d) + ' IST';
}

/**
 * Format standard DD MMM YYYY, HH:mm IST
 */
export function formatDateTimeIST(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const dateStr = formatDateIST(d);
  const timeStr = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
  return `${dateStr}, ${timeStr} IST`;
}

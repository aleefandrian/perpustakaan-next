/**
 * Utility functions for borrowing calculations, calendar-month arithmetic,
 * Asia/Jakarta timezone date handling, and fine computations.
 */

export const LATE_FEE_PER_DAY = 2000;
export const JAKARTA_TIMEZONE = "Asia/Jakarta";

/**
 * Add calendar months to a given date, correctly handling month-end boundaries
 * e.g., Jan 31 + 1 month -> Feb 28 (or 29 on leap year)
 * @param {Date|string|number} dateInput
 * @param {number} months
 * @returns {Date}
 */
export function addCalendarMonth(dateInput, months = 1) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return new Date();

  const originalDay = d.getDate();
  const originalHours = d.getHours();
  const originalMinutes = d.getMinutes();
  const originalSeconds = d.getSeconds();

  // Set to 1st of month first to prevent month overflow
  d.setDate(1);
  d.setMonth(d.getMonth() + months);

  // Determine last day of the new month
  const lastDayOfTargetMonth = new Date(
    d.getFullYear(),
    d.getMonth() + 1,
    0
  ).getDate();

  // Clamp to the last day if original day exceeds target month length
  d.setDate(Math.min(originalDay, lastDayOfTargetMonth));
  d.setHours(originalHours, originalMinutes, originalSeconds, 0);

  return d;
}

/**
 * Returns YYYY-MM-DD string formatted in Asia/Jakarta timezone
 * @param {Date|string|number} dateInput
 * @returns {string}
 */
export function getJakartaDateString(dateInput = new Date()) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: JAKARTA_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(d);
}

/**
 * Parse YYYY-MM-DD string to UTC midnight timestamp to avoid DST/timezone shift
 * @param {string} ymdStr
 * @returns {number}
 */
function toMidnightUtc(ymdStr) {
  const [year, month, day] = ymdStr.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

/**
 * Compute borrowing status, overdue days, remaining days, and late fine
 * @param {Date|string} dueDateInput
 * @param {Date|string} [referenceDateInput] - Optional reference date, defaults to current Jakarta date
 * @returns {{
 *   isOverdue: boolean,
 *   overdueDays: number,
 *   daysRemaining: number,
 *   fineAmount: number,
 *   formattedFine: string,
 *   timeStatusLabel: string,
 *   status: "AKTIF"|"TERLAMBAT"
 * }}
 */
export function calculateBorrowingStatus(dueDateInput, referenceDateInput = new Date()) {
  const dueYmd = getJakartaDateString(dueDateInput);
  const refYmd = getJakartaDateString(referenceDateInput);

  if (!dueYmd || !refYmd) {
    return {
      isOverdue: false,
      overdueDays: 0,
      daysRemaining: 0,
      fineAmount: 0,
      formattedFine: formatRupiah(0),
      timeStatusLabel: "-",
      status: "AKTIF",
    };
  }

  const dueUtc = toMidnightUtc(dueYmd);
  const refUtc = toMidnightUtc(refYmd);

  const diffMs = refUtc - dueUtc;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    const overdueDays = diffDays;
    const fineAmount = overdueDays * LATE_FEE_PER_DAY;
    return {
      isOverdue: true,
      overdueDays,
      daysRemaining: 0,
      fineAmount,
      formattedFine: formatRupiah(fineAmount),
      timeStatusLabel: `Terlambat ${overdueDays} hari`,
      status: "TERLAMBAT",
    };
  }

  // Not overdue (on or before due date)
  const daysRemaining = Math.abs(diffDays);
  const timeStatusLabel =
    daysRemaining === 0 ? "Batas Hari Ini" : `Sisa ${daysRemaining} hari`;

  return {
    isOverdue: false,
    overdueDays: 0,
    daysRemaining,
    fineAmount: 0,
    formattedFine: formatRupiah(0),
    timeStatusLabel,
    status: "AKTIF",
  };
}

/**
 * Format currency to Indonesian Rupiah (IDR)
 * e.g., Rp2.000 or Rp0
 * @param {number} amount
 * @returns {string}
 */
export function formatRupiah(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

/**
 * Format date in Indonesian locale (e.g., 11 Nov 2026 or 11 November 2026)
 * @param {Date|string} dateInput
 * @param {boolean} [longMonth=false]
 * @returns {string}
 */
export function formatIndoDate(dateInput, longMonth = false) {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIMEZONE,
    day: "numeric",
    month: longMonth ? "long" : "short",
    year: "numeric",
  }).format(d);
}

/**
 * Format date with time in Indonesian locale
 * @param {Date|string} dateInput
 * @returns {string}
 */
export function formatIndoDateTime(dateInput) {
  if (!dateInput) return "-";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    timeZone: JAKARTA_TIMEZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d) + " WIB";
}

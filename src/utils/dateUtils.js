/**
 * Normaliza una fecha al inicio del día en UTC (00:00:00.000).
 * @param {Date|string} input
 * @returns {Date}
 */
function startOfDayUtc(input) {
  const d = input instanceof Date ? new Date(input.getTime()) : new Date(input);
  if (Number.isNaN(d.getTime())) {
    throw new Error("Invalid date");
  }
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * Convierte día de semana API (1=lunes … 7=domingo) a getUTCDay() (0=domingo … 6=sábado).
 * @param {number} apiDay
 * @returns {number}
 */
function apiWeekdayToUtc(apiDay) {
  const n = Number(apiDay);
  if (!Number.isInteger(n) || n < 1 || n > 7) {
    throw new Error("weekday must be integer 1-7 (1=Monday, 7=Sunday)");
  }
  return n === 7 ? 0 : n;
}

/**
 * Expande recurrencia: días de semana en rango [startDate, endDate] inclusive (UTC).
 * @param {number[]} weekdaysApi - valores 1-7
 * @param {Date|string} startDate
 * @param {Date|string} endDate
 * @returns {Date[]}
 */
function expandRecurrenceDates(weekdaysApi, startDate, endDate) {
  const start = startOfDayUtc(startDate);
  const end = startOfDayUtc(endDate);
  if (start > end) {
    throw new Error("startDate must be on or before endDate");
  }
  const utcDays = [...new Set(weekdaysApi.map(apiWeekdayToUtc))];
  const out = [];
  const cur = new Date(start.getTime());
  while (cur <= end) {
    if (utcDays.includes(cur.getUTCDay())) {
      out.push(new Date(cur.getTime()));
    }
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

module.exports = {
  startOfDayUtc,
  apiWeekdayToUtc,
  expandRecurrenceDates
};

const RouteAvailabilityRule = require("../models/routeAvailabilityRule");
const RouteDateSlot = require("../models/routeDateSlot");
const Route = require("../models/route");
const Reservation = require("../models/reservation");
const { startOfDayUtc, expandRecurrenceDates } = require("../utils/dateUtils");

async function assertRouteOwner(routeId, driverId) {
  const route = await Route.findById(routeId);
  if (!route) {
    throw new Error("Route not found");
  }
  if (route.driverId !== driverId) {
    throw new Error("Unauthorized");
  }
  return route;
}

/**
 * Recalcula todos los RouteDateSlot a partir de las reglas del routeId.
 */
async function rebuildSlotsForRoute(routeId) {
  const rules = await RouteAvailabilityRule.find({ routeId });
  const seatsByDayMs = new Map();

  for (const rule of rules) {
    if (rule.kind === "SPECIFIC_DATES") {
      for (const e of rule.specificEntries || []) {
        const d = startOfDayUtc(e.date);
        const k = d.getTime();
        seatsByDayMs.set(k, (seatsByDayMs.get(k) || 0) + e.seats);
      }
    } else if (rule.kind === "WEEKLY_RECURRENCE") {
      const dates = expandRecurrenceDates(
        rule.weekdays,
        rule.rangeStart,
        rule.rangeEnd
      );
      for (const dt of dates) {
        const d = startOfDayUtc(dt);
        const k = d.getTime();
        const add = rule.seatsPerOccurrence || 0;
        seatsByDayMs.set(k, (seatsByDayMs.get(k) || 0) + add);
      }
    }
  }

  await RouteDateSlot.deleteMany({ routeId });
  const docs = [...seatsByDayMs.entries()].map(([dayMs, totalSeats]) => ({
    routeId,
    date: new Date(dayMs),
    totalSeats
  }));
  if (docs.length) {
    await RouteDateSlot.insertMany(docs);
  }
}

async function countBlockingReservations(routeId, travelDate) {
  const d = startOfDayUtc(travelDate);
  return Reservation.countDocuments({
    routeId,
    travelDate: d,
    status: { $in: ["PENDING", "CONFIRMED"] }
  });
}

async function listSlotsWithAvailability(routeId, fromDate, toDate) {
  const from = startOfDayUtc(fromDate);
  const to = startOfDayUtc(toDate);
  const slots = await RouteDateSlot.find({
    routeId,
    date: { $gte: from, $lte: to }
  }).sort({ date: 1 });

  const out = [];
  for (const slot of slots) {
    const used = await countBlockingReservations(routeId, slot.date);
    out.push({
      date: slot.date,
      totalSeats: slot.totalSeats,
      usedSeats: used,
      availableSeats: Math.max(0, slot.totalSeats - used)
    });
  }
  return out;
}

async function addRule(routeId, driverId, payload) {
  await assertRouteOwner(routeId, driverId);

  if (payload.kind === "SPECIFIC_DATES") {
    if (!Array.isArray(payload.entries) || payload.entries.length === 0) {
      throw new Error("entries array required for SPECIFIC_DATES");
    }
    const rule = await RouteAvailabilityRule.create({
      routeId,
      kind: "SPECIFIC_DATES",
      specificEntries: payload.entries.map((e) => ({
        date: startOfDayUtc(e.date),
        seats: Number(e.seats)
      }))
    });
    await rebuildSlotsForRoute(routeId);
    return rule;
  }

  if (payload.kind === "WEEKLY_RECURRENCE") {
    if (!Array.isArray(payload.weekdays) || payload.weekdays.length === 0) {
      throw new Error("weekdays required (1=Monday … 7=Sunday)");
    }
    if (!payload.rangeStart || !payload.rangeEnd) {
      throw new Error("rangeStart and rangeEnd required");
    }
    const seats = Number(payload.seatsPerOccurrence);
    if (!Number.isFinite(seats) || seats < 1) {
      throw new Error("seatsPerOccurrence must be >= 1");
    }
    const rule = await RouteAvailabilityRule.create({
      routeId,
      kind: "WEEKLY_RECURRENCE",
      weekdays: payload.weekdays,
      rangeStart: startOfDayUtc(payload.rangeStart),
      rangeEnd: startOfDayUtc(payload.rangeEnd),
      seatsPerOccurrence: seats
    });
    await rebuildSlotsForRoute(routeId);
    return rule;
  }

  throw new Error("Invalid kind");
}

async function deleteRule(routeId, ruleId, driverId) {
  await assertRouteOwner(routeId, driverId);
  const rule = await RouteAvailabilityRule.findOne({ _id: ruleId, routeId });
  if (!rule) {
    throw new Error("Rule not found");
  }
  await rule.deleteOne();
  await rebuildSlotsForRoute(routeId);
  return { deleted: true };
}

async function listRules(routeId, driverId) {
  await assertRouteOwner(routeId, driverId);
  return RouteAvailabilityRule.find({ routeId }).sort({ createdAt: -1 });
}

async function listRulesAndSlots(routeId, driverId, fromDate, toDate) {
  await assertRouteOwner(routeId, driverId);
  const rules = await RouteAvailabilityRule.find({ routeId }).sort({ createdAt: -1 });
  const from = fromDate ? startOfDayUtc(fromDate) : startOfDayUtc(new Date());
  const to = toDate
    ? startOfDayUtc(toDate)
    : new Date(from.getTime() + 180 * 86400000);
  const slots = await listSlotsWithAvailability(routeId, from, to);
  return { rules, slots };
}

/**
 * Valida que exista slot para la fecha y que queden cupos (PENDING+CONFIRMED < total).
 */
async function validateDateAndSeats(routeId, travelDate) {
  const d = startOfDayUtc(travelDate);
  const slot = await RouteDateSlot.findOne({ routeId, date: d });
  if (!slot) {
    throw new Error("Date not available for this route");
  }
  const used = await countBlockingReservations(routeId, d);
  if (used >= slot.totalSeats) {
    throw new Error("No seats available for this date");
  }
  return slot;
}

async function canAcceptReservation(routeId, travelDate) {
  const d = startOfDayUtc(travelDate);
  const slot = await RouteDateSlot.findOne({ routeId, date: d });
  if (!slot) {
    return { ok: false, reason: "Date not available for this route" };
  }
  const used = await countBlockingReservations(routeId, d);
  /** Cupo lleno solo si hay más solicitudes/reservas bloqueantes que cupos (p. ej. overbooking). */
  if (used > slot.totalSeats) {
    return { ok: false, reason: "No seats available for this date" };
  }
  return { ok: true, slot };
}

module.exports = {
  rebuildSlotsForRoute,
  countBlockingReservations,
  listSlotsWithAvailability,
  addRule,
  deleteRule,
  listRules,
  listRulesAndSlots,
  validateDateAndSeats,
  canAcceptReservation,
  assertRouteOwner
};

const Reservation = require("../models/reservation");
const Route = require("../models/route");
const {
  validateDateAndSeats,
  canAcceptReservation
} = require("./availabilityService");
const { startOfDayUtc } = require("../utils/dateUtils");

exports.requestReservation = async (routeId, passengerId, travelDateInput) => {
  if (!travelDateInput) {
    throw new Error("travelDate is required");
  }

  const route = await Route.findById(routeId);
  if (!route || route.status !== "ACTIVE") {
    throw new Error("Route not available");
  }

  const travelDate = startOfDayUtc(travelDateInput);
  await validateDateAndSeats(routeId, travelDate);

  const dup = await Reservation.findOne({
    routeId,
    passengerId,
    travelDate,
    status: { $in: ["PENDING", "CONFIRMED"] }
  });
  if (dup) {
    throw new Error("You already have a pending or confirmed request for this date");
  }

  return Reservation.create({
    routeId,
    passengerId,
    travelDate,
    status: "PENDING"
  });
};

exports.acceptReservation = async (reservationId, driverId) => {
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    throw new Error("Reservation not found");
  }

  const route = await Route.findById(reservation.routeId);
  if (!route) {
    throw new Error("Route not found");
  }
  if (route.driverId !== driverId) {
    throw new Error("Unauthorized");
  }

  if (reservation.status !== "PENDING") {
    throw new Error("Only pending requests can be accepted");
  }

  if (route.status !== "ACTIVE") {
    throw new Error("Route is not active");
  }

  const check = await canAcceptReservation(
    reservation.routeId,
    reservation.travelDate
  );
  if (!check.ok) {
    throw new Error(check.reason);
  }

  reservation.status = "CONFIRMED";
  await reservation.save();
  return reservation;
};

exports.rejectReservation = async (reservationId, driverId) => {
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    throw new Error("Reservation not found");
  }

  const route = await Route.findById(reservation.routeId);
  if (!route || route.driverId !== driverId) {
    throw new Error("Unauthorized");
  }

  if (reservation.status !== "PENDING") {
    throw new Error("Only pending requests can be rejected");
  }

  reservation.status = "REJECTED";
  await reservation.save();
  return reservation;
};

exports.cancelReservation = async (reservationId, userId) => {
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    throw new Error("Reservation not found");
  }

  if (reservation.passengerId !== userId) {
    throw new Error("Unauthorized");
  }

  if (reservation.status === "CANCELLED" || reservation.status === "REJECTED") {
    return reservation;
  }

  reservation.status = "CANCELLED";
  await reservation.save();
  return reservation;
};

/** Solicitudes recibidas por el conductor (PENDING) o todas según filtro */
exports.listForDriver = async (driverId, statusFilter) => {
  const routes = await Route.find({ driverId }).select("_id");
  const routeIds = routes.map((r) => r._id);
  if (!routeIds.length) {
    return [];
  }

  const q = { routeId: { $in: routeIds } };
  if (statusFilter && statusFilter !== "ALL") {
    q.status = statusFilter;
  }

  return Reservation.find(q)
    .populate("routeId")
    .sort({ createdAt: -1 });
};

/** Solicitudes del pasajero: PENDING + REJECTED */
exports.listPassengerRequests = async (passengerId) => {
  return Reservation.find({
    passengerId,
    status: { $in: ["PENDING", "REJECTED"] }
  })
    .populate("routeId")
    .sort({ createdAt: -1 });
};

/** Reservas confirmadas (futuras o todas activas confirmadas) */
exports.listPassengerConfirmed = async (passengerId) => {
  const today = startOfDayUtc(new Date());
  return Reservation.find({
    passengerId,
    status: "CONFIRMED",
    travelDate: { $gte: today }
  })
    .populate("routeId")
    .sort({ travelDate: 1 });
};

/** Historial: viajes confirmados en el pasado */
exports.listPassengerHistory = async (passengerId) => {
  const today = startOfDayUtc(new Date());
  return Reservation.find({
    passengerId,
    status: "CONFIRMED",
    travelDate: { $lt: today }
  })
    .populate("routeId")
    .sort({ travelDate: -1 });
};

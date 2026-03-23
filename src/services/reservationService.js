const Reservation = require("../models/Reservation");
const Route = require("../models/Route");

// 🟡 Solicitar reserva (PASAJERO)
exports.requestReservation = async (routeId, passengerId) => {
  const route = await Route.findById(routeId);

  if (!route || route.status !== "ACTIVE") {
    throw new Error("Route not available");
  }

  return await Reservation.create({
    routeId,
    passengerId
  });
};

// 🟢 Aceptar solicitud (CONDUCTOR)
exports.acceptReservation = async (reservationId, driverId) => {
  const reservation = await Reservation.findById(reservationId);
  const route = await Route.findById(reservation.routeId);

  if (route.driverId !== driverId) {
    throw new Error("Unauthorized");
  }

  if (route.availableSeats <= 0) {
    throw new Error("No seats available");
  }

  reservation.status = "ACCEPTED";
  route.availableSeats -= 1;

  await reservation.save();
  await route.save();

  return reservation;
};

// 🔴 Rechazar solicitud (CONDUCTOR)
exports.rejectReservation = async (reservationId, driverId) => {
  const reservation = await Reservation.findById(reservationId);
  const route = await Route.findById(reservation.routeId);

  if (route.driverId !== driverId) {
    throw new Error("Unauthorized");
  }

  reservation.status = "REJECTED";
  await reservation.save();

  return reservation;
};

// ❌ Cancelar reserva (PASAJERO)
exports.cancelReservation = async (reservationId, userId) => {
  const reservation = await Reservation.findById(reservationId);
  const route = await Route.findById(reservation.routeId);

  if (reservation.passengerId !== userId) {
    throw new Error("Unauthorized");
  }

  if (reservation.status === "ACCEPTED") {
    route.availableSeats += 1;
    await route.save();
  }

  reservation.status = "CANCELLED";
  await reservation.save();

  return reservation;
};
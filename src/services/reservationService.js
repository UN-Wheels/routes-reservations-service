const Reservation = require("../models/Reservation");
const Route = require("../models/route");

exports.createReservation = async (routeId, passengerId) => {

  const route = await Route.findById(routeId);

  if (!route) {
    throw new Error("Route not found");
  }

  if (route.availableSeats <= 0) {
    throw new Error("No seats available");
  }

  const reservation = new Reservation({
    routeId,
    passengerId
  });

  route.availableSeats -= 1;

  await route.save();
  await reservation.save();

  return reservation;
};

exports.cancelReservation = async (reservationId) => {

  const reservation = await Reservation.findById(reservationId);
  const route = await Route.findById(reservation.routeId);

  reservation.status = "CANCELLED";

  route.availableSeats += 1;

  await reservation.save();
  await route.save();

  return reservation;
};
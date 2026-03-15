const Route = require("../models/route");

exports.createRoute = async (data, driverId) => {

  const route = new Route({
    driverId,
    origin: data.origin,
    destination: data.destination,
    departureTime: data.departureTime,
    totalSeats: data.totalSeats,
    availableSeats: data.totalSeats
  });

  return await route.save();
};

exports.getRoutes = async () => {
  return await Route.find({ status: "ACTIVE" });
};
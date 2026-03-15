const ActiveTrip = require("../models/ActiveTrip");
const TripHistory = require("../models/TripHistory");

exports.startTrip = async (tripId, driverId) => {
  return await ActiveTrip.create({
    tripId,
    driverId,
    passengers: [],
    status: "IN_PROGRESS",
    currentLocation: null
  });
};

exports.endTrip = async (tripId) => {
  const trip = await ActiveTrip.findOne({ tripId });
  if (!trip) throw new Error("Trip not found");

  const history = await TripHistory.create({
    tripId: trip.tripId,
    driverId: trip.driverId,
    passengers: trip.passengers,
    startedAt: trip.createdAt,
    endedAt: new Date(),
    locations: []
  });

  await ActiveTrip.deleteOne({ tripId });

  return history;
};

exports.updateLocation = async (tripId, location) => {
  return await ActiveTrip.findOneAndUpdate(
    { tripId },
    { currentLocation: location },
    { new: true }
  );
};
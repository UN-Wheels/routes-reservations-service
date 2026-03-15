const mongoose = require("mongoose");

const ActiveTripSchema = new mongoose.Schema({
  tripId: { type: String, required: true, unique: true },
  driverId: { type: String, required: true },
  passengers: [{ type: String }],
  status: { type: String, default: "IN_PROGRESS" },
  currentLocation: {
    lat: Number,
    lng: Number,
    timestamp: Date
  }
});

module.exports = mongoose.model("ActiveTrip", ActiveTripSchema);
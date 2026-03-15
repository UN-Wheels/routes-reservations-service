const mongoose = require("mongoose");

const TripHistorySchema = new mongoose.Schema({
  tripId: String,
  driverId: String,
  passengers: [String],
  startedAt: Date,
  endedAt: Date,
  locations: [
    {
      lat: Number,
      lng: Number,
      timestamp: Date
    }
  ]
});

module.exports = mongoose.model("TripHistory", TripHistorySchema);
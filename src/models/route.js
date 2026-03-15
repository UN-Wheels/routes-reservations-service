const mongoose = require("mongoose");

const RouteSchema = new mongoose.Schema({
  driverId: { type: String, required: true },

  origin: {
    name: String,
    lat: Number,
    lng: Number
  },

  destination: {
    name: String,
    lat: Number,
    lng: Number
  },

  departureTime: Date,

  totalSeats: Number,
  availableSeats: Number,

  status: {
    type: String,
    default: "ACTIVE"
  }
});

module.exports = mongoose.model("Route", RouteSchema);

const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({

  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route"
  },

  passengerId: String,

  pickupLocation: {
    name: String,
    lat: Number,
    lng: Number
  },

  status: {
    type: String,
    enum: ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED"],
    default: "PENDING"
  },

  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model("Reservation", ReservationSchema);
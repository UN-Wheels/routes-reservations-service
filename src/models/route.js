const mongoose = require("mongoose");

const RouteSchema = new mongoose.Schema(
  {
    driverId: { type: String, required: true },
    vehicleId: { type: String },

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

  stops: [
    {
      passengerId: String,
      name: String,
      lat: Number,
      lng: Number,
      order: Number,
      visitedAt: Date
    }
  ],

  optimizedRoute: [
    {
      type: {type: String}, // 'origin', 'stop-{passengerId}', 'destination'
      lat: Number,
      lng: Number,
      name: String,
      order: Number
    }
  ],

  departureTime: Date,

    /** Precio por cupo (pasajero) */
    pricePerSeat: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ["ACTIVE", "IN_PROGRESS", "COMPLETED", "INACTIVE"],
      default: "ACTIVE"
    },

    startedAt: Date,
    completedAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Route", RouteSchema);

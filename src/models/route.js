const mongoose = require("mongoose");

const RouteSchema = new mongoose.Schema(
  {
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

    /** Hora habitual de salida (referencia; el cupo real es por fecha en RouteDateSlot) */
    departureTime: Date,

    /** Precio por cupo (pasajero) */
    pricePerSeat: {
      type: Number,
      required: true,
      min: 0
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Route", RouteSchema);

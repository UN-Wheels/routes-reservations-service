const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema(
  {
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
      index: true
    },

    passengerId: {
      type: String,
      required: true,
      index: true
    },

    /** Fecha del viaje solicitado (cupos por fecha) */
    travelDate: {
      type: Date,
      required: true,
      index: true
    },

    /**
     * Solicitud / reserva:
     * PENDING | REJECTED = solicitud
     * CONFIRMED | CANCELLED = reserva (confirmada o cancelada)
     */
    status: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "REJECTED", "CANCELLED"],
      default: "PENDING"
    }
  },
  { timestamps: true }
);

ReservationSchema.index({ routeId: 1, travelDate: 1, passengerId: 1, status: 1 });

module.exports = mongoose.model("Reservation", ReservationSchema);

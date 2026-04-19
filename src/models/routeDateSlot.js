const mongoose = require("mongoose");

/**
 * Cupos por fecha concreta para una ruta (materializado a partir de reglas).
 */
const RouteDateSlotSchema = new mongoose.Schema(
  {
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
      index: true
    },
    date: {
      type: Date,
      required: true
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1
    }
  },
  { timestamps: true }
);

RouteDateSlotSchema.index({ routeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("RouteDateSlot", RouteDateSlotSchema);

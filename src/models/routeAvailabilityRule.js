const mongoose = require("mongoose");

/**
 * Configuración de disponibilidad: fechas específicas o recurrencia en rango.
 * Los cupos por día se materializan en RouteDateSlot al guardar/eliminar reglas.
 */
const RouteAvailabilityRuleSchema = new mongoose.Schema(
  {
    routeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true,
      index: true
    },
    kind: {
      type: String,
      enum: ["SPECIFIC_DATES", "WEEKLY_RECURRENCE"],
      required: true
    },
    /** kind SPECIFIC_DATES: [{ date, seats }] */
    specificEntries: [
      {
        date: { type: Date, required: true },
        seats: { type: Number, required: true, min: 1 }
      }
    ],
    /** kind WEEKLY_RECURRENCE */
    weekdays: [{ type: Number, min: 1, max: 7 }],
    rangeStart: Date,
    rangeEnd: Date,
    seatsPerOccurrence: { type: Number, min: 1 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("RouteAvailabilityRule", RouteAvailabilityRuleSchema);

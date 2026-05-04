const service = require("../services/reservationService");

const clientError = (res, status, message) => res.status(status).json({ error: message });

exports.requestReservation = async (req, res) => {
  try {
    const { routeId, travelDate, pickupLocation } = req.body;
    const result = await service.requestReservation(routeId, req.user.id, travelDate, pickupLocation);
    res.status(201).json(result);
  } catch (e) {
    if (
      [
        "Route not available",
        "Date not available for this route",
        "No seats available for this date",
        "travelDate is required"
      ].includes(e.message) ||
      e.message.includes("already have")
    ) {
      return clientError(res, 400, e.message);
    }
    // 🗺️ Errores de validación geográfica
    if (
      e.message.includes("Cundinamarca") ||
      e.message.includes("Universidad") ||
      e.message.includes("entrada") ||
      e.message.includes("pickupLocation")
    ) {
      return clientError(res, 400, e.message);
    }
    res.status(500).json({ error: e.message });
  }
};

exports.acceptReservation = async (req, res) => {
  try {
    const result = await service.acceptReservation(req.params.id, req.user.id);
    res.json(result);
  } catch (e) {
    if (["Unauthorized", "Reservation not found", "Route not found"].includes(e.message)) {
      const code = e.message === "Unauthorized" ? 403 : 404;
      return clientError(res, code, e.message);
    }
    if (
      e.message.includes("Only pending") ||
      e.message.includes("not active") ||
      e.message.includes("No seats") ||
      e.message.includes("Date not available")
    ) {
      return clientError(res, 400, e.message);
    }
    res.status(500).json({ error: e.message });
  }
};

exports.rejectReservation = async (req, res) => {
  try {
    const result = await service.rejectReservation(req.params.id, req.user.id);
    res.json(result);
  } catch (e) {
    if (["Unauthorized", "Reservation not found", "Route not found"].includes(e.message)) {
      const code = e.message === "Unauthorized" ? 403 : 404;
      return clientError(res, code, e.message);
    }
    if (e.message.includes("Only pending")) {
      return clientError(res, 400, e.message);
    }
    res.status(500).json({ error: e.message });
  }
};

exports.cancelReservation = async (req, res) => {
  try {
    const result = await service.cancelReservation(req.params.id, req.user.id);
    res.json(result);
  } catch (e) {
    if (["Unauthorized", "Reservation not found"].includes(e.message)) {
      const code = e.message === "Unauthorized" ? 403 : 404;
      return clientError(res, code, e.message);
    }
    res.status(500).json({ error: e.message });
  }
};

/** Solicitudes pendientes recibidas (conductor) */
exports.listDriverRequests = async (req, res) => {
  try {
    const rows = await service.listForDriver(req.user.id, "PENDING");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/** Reservas confirmadas en las rutas del conductor */
exports.listDriverConfirmed = async (req, res) => {
  try {
    const rows = await service.listForDriver(req.user.id, "CONFIRMED");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/** Solicitudes realizadas por el pasajero (pendientes y rechazadas) */
exports.listPassengerRequests = async (req, res) => {
  try {
    const rows = await service.listPassengerRequests(req.user.id);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/** Reservas confirmadas próximas (pasajero) */
exports.listPassengerConfirmed = async (req, res) => {
  try {
    const rows = await service.listPassengerConfirmed(req.user.id);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

/** Historial de viajes (pasajero): confirmados en el pasado */
exports.listPassengerHistory = async (req, res) => {
  try {
    const rows = await service.listPassengerHistory(req.user.id);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

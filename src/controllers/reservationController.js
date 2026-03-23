const service = require("../services/reservationService");


// 🟡 Solicitar reserva (PASAJERO)
exports.requestReservation = async (req, res) => {
  try {
    const result = await service.requestReservation(
      req.body.routeId,
      req.user.id
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// 🟢 Aceptar solicitud (CONDUCTOR)
exports.acceptReservation = async (req, res) => {
  try {
    const result = await service.acceptReservation(
      req.params.id,
      req.user.id
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// 🔴 Rechazar solicitud (CONDUCTOR)
exports.rejectReservation = async (req, res) => {
  try {
    const result = await service.rejectReservation(
      req.params.id,
      req.user.id
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// ❌ Cancelar reserva (PASAJERO)
exports.cancelReservation = async (req, res) => {
  try {
    const result = await service.cancelReservation(
      req.params.id,
      req.user.id
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
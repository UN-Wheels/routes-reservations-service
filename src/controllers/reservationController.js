const service = require("../services/reservationService");

// Solicitar
exports.request = async (req, res) => {
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

// Aceptar
exports.accept = async (req, res) => {
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

// Rechazar
exports.reject = async (req, res) => {
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

// Cancelar
exports.cancel = async (req, res) => {
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
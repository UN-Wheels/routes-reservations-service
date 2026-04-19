const routeService = require("../services/routeService");
const availabilityService = require("../services/availabilityService");

const clientError = (res, status, message) => res.status(status).json({ error: message });

exports.createRoute = async (req, res) => {
  try {
    const driverId = req.user.id;
    const route = await routeService.createRoute(req.body, driverId);
    res.status(201).json(route);
  } catch (err) {
    if (err.message === "pricePerSeat is required and must be >= 0") {
      return clientError(res, 400, err.message);
    }
    res.status(500).json({ error: err.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const driverId = req.user.id;
    const route = await routeService.updateRoute(req.params.id, driverId, req.body);
    res.json(route);
  } catch (err) {
    if (["Route not found", "Unauthorized"].includes(err.message)) {
      return clientError(res, err.message === "Unauthorized" ? 403 : 404, err.message);
    }
    if (err.message.includes("pricePerSeat") || err.message.includes("status must")) {
      return clientError(res, 400, err.message);
    }
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const driverId = req.user.id;
    const result = await routeService.deleteRoute(req.params.id, driverId);
    res.json(result);
  } catch (err) {
    if (["Route not found", "Unauthorized"].includes(err.message)) {
      return clientError(res, err.message === "Unauthorized" ? 403 : 404, err.message);
    }
    res.status(500).json({ error: err.message });
  }
};

exports.getMyRoutes = async (req, res) => {
  try {
    const routes = await routeService.getMyRoutes(req.user.id);
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRoutes = async (req, res) => {
  try {
    const routes = await routeService.getRoutes();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRouteById = async (req, res) => {
  try {
    const route = await routeService.getRouteById(req.params.id);
    res.json(route);
  } catch (err) {
    if (err.message === "Route not found") {
      return clientError(res, 404, err.message);
    }
    res.status(500).json({ error: err.message });
  }
};

/** Cupos por fecha (público, solo rutas activas en servicio) */
exports.getRouteSlotsPublic = async (req, res) => {
  try {
    const { from, to } = req.query;
    const slots = await routeService.getPublicSlotsForRoute(
      req.params.id,
      from || undefined,
      to || undefined
    );
    res.json(slots);
  } catch (err) {
    if (["Route not found", "Route not available"].includes(err.message)) {
      return clientError(res, 404, err.message);
    }
    res.status(500).json({ error: err.message });
  }
};

/** Disponibilidad configurada + slots (solo conductor de la ruta) */
exports.getRouteAvailability = async (req, res) => {
  try {
    const { from, to } = req.query;
    const data = await availabilityService.listRulesAndSlots(
      req.params.id,
      req.user.id,
      from || undefined,
      to || undefined
    );
    res.json(data);
  } catch (err) {
    if (["Route not found", "Unauthorized"].includes(err.message)) {
      return clientError(res, err.message === "Unauthorized" ? 403 : 404, err.message);
    }
    res.status(500).json({ error: err.message });
  }
};

exports.addAvailabilityRule = async (req, res) => {
  try {
    const rule = await availabilityService.addRule(
      req.params.id,
      req.user.id,
      req.body
    );
    res.status(201).json(rule);
  } catch (err) {
    if (["Route not found", "Unauthorized"].includes(err.message)) {
      return clientError(res, err.message === "Unauthorized" ? 403 : 404, err.message);
    }
    if (
      err.message.includes("required") ||
      err.message.includes("Invalid") ||
      err.message.includes("weekday") ||
      err.message.includes("startDate")
    ) {
      return clientError(res, 400, err.message);
    }
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAvailabilityRule = async (req, res) => {
  try {
    const result = await availabilityService.deleteRule(
      req.params.id,
      req.params.ruleId,
      req.user.id
    );
    res.json(result);
  } catch (err) {
    if (["Route not found", "Unauthorized", "Rule not found"].includes(err.message)) {
      const code =
        err.message === "Unauthorized" ? 403 : err.message === "Route not found" ? 404 : 404;
      return clientError(res, code, err.message);
    }
    res.status(500).json({ error: err.message });
  }
};

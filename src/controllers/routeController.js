const routeService = require("../services/routeService");

// 🟢 Publicar ruta (CONDUCTOR)

exports.createRoute = async (req, res) => {
  try {
    const driverId = req.user.id;
    const route = await routeService.createRoute(req.body, driverId);
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔍 Obtener rutas disponibles

exports.getRoutes = async (req, res) => {
  try {
    const routes = await routeService.getRoutes();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔎 Obtener una ruta con datos para mapa

exports.getRouteById = async (req, res) => {
  try {
    const route = await routeService.getRouteById(req.params.id);
    res.json(route);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ Cancelar ruta (CONDUCTOR)

exports.cancelRoute = async (req, res) => {
  try {
    const driverId = req.user.id;
    const routeId = req.params.id;
    const route = await routeService.cancelRoute(routeId, driverId);
    res.json({
      message: "Route cancelled successfully",
      route
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🚀 Iniciar ruta y calcular mejor secuencia (CONDUCTOR)

exports.startRoute = async (req, res) => {
  try {
    const driverId = req.user.id;
    const routeId = req.params.id;
    const route = await routeService.startRoute(routeId, driverId);
    res.json({
      message: "Route started successfully with optimized sequence",
      route
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📊 Obtener detalles de la ruta optimizada (CONDUCTOR)

exports.getOptimizedRouteDetails = async (req, res) => {
  try {
    const driverId = req.user.id;
    const routeId = req.params.id;
    const details = await routeService.getOptimizedRouteDetails(
      routeId,
      driverId
    );
    res.json(details);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
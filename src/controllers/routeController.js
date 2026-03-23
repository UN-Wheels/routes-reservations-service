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
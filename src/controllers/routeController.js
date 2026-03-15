const routeService = require("../services/routeService");

exports.createRoute = async (req, res) => {

  try {

    const driverId = req.user.id;

    const route = await routeService.createRoute(req.body, driverId);

    res.json(route);

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
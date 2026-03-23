const Route = require("../models/Route");

// 🟢 Publicar ruta (CONDUCTOR)
exports.createRoute = async (data, driverId) => {
  return await Route.create({
    ...data,
    driverId,
    availableSeats: data.totalSeats
  });
};

// ❌ Cancelar ruta (CONDUCTOR)
exports.cancelRoute = async (routeId, driverId) => {
  const route = await Route.findById(routeId);

  if (route.driverId !== driverId) {
    throw new Error("Unauthorized");
  }

  route.status = "CANCELLED";
  await route.save();

  return route;
};

// 🔎 Obtener rutas disponibles (SIN 0 CUPOS)
exports.getAvailableRoutes = async () => {
  return await Route.find({
    status: "ACTIVE",
    availableSeats: { $gt: 0 }
  });
};
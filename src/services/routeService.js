const Route = require("../models/route");

const buildMapLinks = (route) => {
  const origin = `${route.origin.lat},${route.origin.lng}`;
  const destination = `${route.destination.lat},${route.destination.lng}`;

  return {
    googleMaps: `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`,
    appleMaps: `https://maps.apple.com/?saddr=${origin}&daddr=${destination}&dirflg=d`
  };
};

const enrichRouteWithMapData = (route) => {
  if (!route) {
    return route;
  }

  const plainRoute = route.toObject ? route.toObject() : route;

  return {
    ...plainRoute,
    mapLinks: buildMapLinks(plainRoute),
    routePreview: {
      type: "LineString",
      coordinates: [
        [plainRoute.origin.lng, plainRoute.origin.lat],
        [plainRoute.destination.lng, plainRoute.destination.lat]
      ]
    }
  };
};

// 🟢 Publicar ruta (CONDUCTOR)
exports.createRoute = async (data, driverId) => {
  const route = await Route.create({
    ...data,
    driverId,
    availableSeats: data.totalSeats
  });

  return enrichRouteWithMapData(route);
};

// ❌ Cancelar ruta (CONDUCTOR)
exports.cancelRoute = async (routeId, driverId) => {
  const route = await Route.findById(routeId);

  if (!route) {
    throw new Error("Route not found");
  }

  if (route.driverId !== driverId) {
    throw new Error("Unauthorized");
  }

  route.status = "CANCELLED";
  await route.save();

  return route;
};

// 🔎 Obtener rutas disponibles (SIN 0 CUPOS)
exports.getRoutes = async () => {
  const routes = await Route.find({
    status: "ACTIVE",
    availableSeats: { $gt: 0 }
  });

  return routes.map(enrichRouteWithMapData);
};

// 🔎 Obtener una ruta por ID con datos para mapa
exports.getRouteById = async (routeId) => {
  const route = await Route.findById(routeId);

  if (!route) {
    throw new Error("Route not found");
  }

  return enrichRouteWithMapData(route);
};
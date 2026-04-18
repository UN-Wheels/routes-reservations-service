const Route = require("../models/route");
const { getDistance } = require("geolib");

// 📍 Calcular distancia entre dos puntos (en metros)
const calculateDistance = (point1, point2) => {
  return getDistance(
    { latitude: point1.lat, longitude: point1.lng },
    { latitude: point2.lat, longitude: point2.lng }
  );
};

// 🎯 Algoritmo de Nearest Neighbor para optimizar la ruta (TSP)
const optimizeRoute = (origin, destination, stops) => {
  if (!stops || stops.length === 0) {
    return [
      { type: "origin", ...origin, order: 1 },
      { type: "destination", ...destination, order: 2 }
    ];
  }

  let unvisited = [...stops];
  let currentLocation = origin;
  let optimizedPath = [
    { type: "origin", ...origin, order: 0, visitOrder: 0 }
  ];
  let visitOrder = 1;

  // Nearest Neighbor Algorithm: siempre ir al punto más cercano no visitado
  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let shortestDistance = calculateDistance(currentLocation, unvisited[0]);

    // Encontrar la parada más cercana
    for (let i = 1; i < unvisited.length; i++) {
      const distance = calculateDistance(currentLocation, unvisited[i]);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestIndex = i;
      }
    }

    // Agregar la parada más cercana al camino
    const nearestStop = unvisited[nearestIndex];
    optimizedPath.push({
      type: `stop-${nearestStop.passengerId}`,
      lat: nearestStop.lat,
      lng: nearestStop.lng,
      name: nearestStop.name,
      passengerId: nearestStop.passengerId,
      order: visitOrder,
      visitOrder: visitOrder
    });

    currentLocation = nearestStop;
    unvisited.splice(nearestIndex, 1);
    visitOrder++;
  }

  // Agregar el destino final
  optimizedPath.push({
    type: "destination",
    ...destination,
    order: visitOrder,
    visitOrder: visitOrder
  });

  return optimizedPath;
};

// �️ Construir enlaces de mapa
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

// 🚀 INICIAR RUTA Y CALCULAR LA MEJOR SECUENCIA
exports.startRoute = async (routeId, driverId) => {
  const route = await Route.findById(routeId);

  if (!route) {
    throw new Error("Route not found");
  }

  if (route.driverId !== driverId) {
    throw new Error("Unauthorized");
  }

  if (route.status !== "ACTIVE") {
    throw new Error("Route is not active");
  }

  // Obtener todas las reservas confirmadas para esta ruta
  const Reservation = require("../models/reservation");
  const reservations = await Reservation.find({
    routeId: routeId,
    status: "CONFIRMED"
  });

  // Construir array de paradas desde las reservas
  const stops = reservations.map((res) => ({
    passengerId: res.passengerId,
    name: res.pickupLocation?.name || `Pickup - ${res.passengerId}`,
    lat: res.pickupLocation?.lat || 0,
    lng: res.pickupLocation?.lng || 0
  }));

  // Calcular la mejor ruta usando el algoritmo de Nearest Neighbor
  const optimizedRoute = optimizeRoute(route.origin, route.destination, stops);

  // Actualizar la ruta con la secuencia optimizada
  route.optimizedRoute = optimizedRoute;
  route.status = "IN_PROGRESS";
  route.startedAt = new Date();
  await route.save();

  return {
    ...enrichRouteWithMapData(route),
    optimizedRoute: optimizedRoute,
    message: "Route started successfully with optimized sequence"
  };
};

// 📊 OBTENER ESTADÍSTICAS DE LA RUTA OPTIMIZADA
exports.getOptimizedRouteDetails = async (routeId, driverId) => {
  const route = await Route.findById(routeId);

  if (!route) {
    throw new Error("Route not found");
  }

  if (route.driverId !== driverId) {
    throw new Error("Unauthorized");
  }

  if (!route.optimizedRoute || route.optimizedRoute.length === 0) {
    throw new Error("Route has not been started yet");
  }

  // Calcular distancias totales
  let totalDistance = 0;
  for (let i = 0; i < route.optimizedRoute.length - 1; i++) {
    const current = route.optimizedRoute[i];
    const next = route.optimizedRoute[i + 1];
    const distance = calculateDistance(
      { lat: current.lat, lng: current.lng },
      { lat: next.lat, lng: next.lng }
    );
    totalDistance += distance;
  }

  return {
    routeId: route._id,
    driverId: route.driverId,
    optimizedRoute: route.optimizedRoute,
    totalDistance: totalDistance, // en metros
    totalDistanceKm: (totalDistance / 1000).toFixed(2),
    status: route.status,
    startedAt: route.startedAt,
    stops: route.stops,
    origin: route.origin,
    destination: route.destination
  };
};
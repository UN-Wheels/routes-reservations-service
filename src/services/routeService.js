const Route = require("../models/route");
const RouteDateSlot = require("../models/routeDateSlot");
const RouteAvailabilityRule = require("../models/routeAvailabilityRule");
const Reservation = require("../models/reservation");
const { listSlotsWithAvailability } = require("./availabilityService");
const { startOfDayUtc } = require("../utils/dateUtils");

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

exports.createRoute = async (data, driverId) => {
  const pricePerSeat =
    data.pricePerSeat !== undefined ? Number(data.pricePerSeat) : NaN;
  if (!Number.isFinite(pricePerSeat) || pricePerSeat < 0) {
    throw new Error("pricePerSeat is required and must be >= 0");
  }

  const route = await Route.create({
    origin: data.origin,
    destination: data.destination,
    departureTime: data.departureTime,
    pricePerSeat,
    status: data.status === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    driverId
  });

  return enrichRouteWithMapData(route);
};

exports.updateRoute = async (routeId, driverId, data) => {
  const route = await Route.findById(routeId);
  if (!route) {
    throw new Error("Route not found");
  }
  if (route.driverId !== driverId) {
    throw new Error("Unauthorized");
  }

  if (data.origin !== undefined) {
    route.origin = data.origin;
  }
  if (data.destination !== undefined) {
    route.destination = data.destination;
  }
  if (data.departureTime !== undefined) {
    route.departureTime = data.departureTime;
  }
  if (data.pricePerSeat !== undefined) {
    const p = Number(data.pricePerSeat);
    if (!Number.isFinite(p) || p < 0) {
      throw new Error("pricePerSeat must be >= 0");
    }
    route.pricePerSeat = p;
  }
  if (data.status !== undefined) {
    if (!["ACTIVE", "INACTIVE"].includes(data.status)) {
      throw new Error("status must be ACTIVE or INACTIVE");
    }
    route.status = data.status;
  }

  await route.save();
  return enrichRouteWithMapData(route);
};

/**
 * Eliminación en cascada: disponibilidades (reglas + slots), solicitudes/reservas, ruta.
 */
exports.deleteRoute = async (routeId, driverId) => {
  const route = await Route.findById(routeId);
  if (!route) {
    throw new Error("Route not found");
  }
  if (route.driverId !== driverId) {
    throw new Error("Unauthorized");
  }

  await RouteAvailabilityRule.deleteMany({ routeId: route._id });
  await RouteDateSlot.deleteMany({ routeId: route._id });
  await Reservation.deleteMany({ routeId: route._id });
  await route.deleteOne();

  return { deleted: true, id: routeId };
};

/** Rutas públicas con al menos un día futuro con cupos libres */
exports.getRoutes = async () => {
  const today = startOfDayUtc(new Date());
  const routes = await Route.find({ status: "ACTIVE" });
  const usable = [];

  for (const route of routes) {
    const slots = await RouteDateSlot.find({
      routeId: route._id,
      date: { $gte: today }
    });
    let hasAvailability = false;
    for (const slot of slots) {
      const list = await listSlotsWithAvailability(route._id, slot.date, slot.date);
      const row = list[0];
      if (row && row.availableSeats > 0) {
        hasAvailability = true;
        break;
      }
    }
    if (hasAvailability) {
      usable.push(route);
    }
  }

  return usable.map(enrichRouteWithMapData);
};

exports.getRouteById = async (routeId) => {
  const route = await Route.findById(routeId);

  if (!route) {
    throw new Error("Route not found");
  }

  return enrichRouteWithMapData(route);
};

exports.getMyRoutes = async (driverId) => {
  const routes = await Route.find({ driverId }).sort({ createdAt: -1 });
  return routes.map(enrichRouteWithMapData);
};

exports.getPublicSlotsForRoute = async (routeId, fromDate, toDate) => {
  const route = await Route.findById(routeId);
  if (!route) {
    throw new Error("Route not found");
  }
  if (route.status !== "ACTIVE") {
    throw new Error("Route not available");
  }
  const from = fromDate ? startOfDayUtc(fromDate) : startOfDayUtc(new Date());
  const to = toDate
    ? startOfDayUtc(toDate)
    : new Date(from.getTime() + 90 * 86400000);
  return listSlotsWithAvailability(routeId, from, to);
};

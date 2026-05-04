/**
 * 🗺️ Utilidades Geográficas
 * - Validar límites de Cundinamarca
 * - Gestionar entradas de la Universidad
 * - Validar zonas especiales
 */

// 🎓 ENTRADAS DE LA UNIVERSIDAD (Bogotá)
// Basado en ubicaciones reales de la Universidad Nacional
const UNIVERSITY_ENTRANCES = [
  {
    id: "u-entrance-1",
    name: "Entrada Principal - Cra 30 con Calle 45",
    lat: 4.7208,
    lng: -74.0555,
    radius: 150 // metros de tolerancia
  },
  {
    id: "u-entrance-2",
    name: "Entrada Sur - Cra 30 con Calle 39",
    lat: 4.7158,
    lng: -74.0555,
    radius: 150
  },
  {
    id: "u-entrance-3",
    name: "Entrada Oriente - Cra 45 con Calle 45",
    lat: 4.7208,
    lng: -74.0447,
    radius: 150
  },
  {
    id: "u-entrance-4",
    name: "Entrada Occidente - Cra 30 con Calle 45 (Medicina)",
    lat: 4.7230,
    lng: -74.0570,
    radius: 150
  }
];

// 🏘️ LÍMITES DE CUNDINAMARCA
// Coordenadas aproximadas de los límites del departamento
const CUNDINAMARCA_BOUNDS = {
  north: 5.8, // Límite norte
  south: 3.5, // Límite sur
  east: -73.0, // Límite este
  west: -75.5 // Límite oeste
};

// 🏛️ ZONA DE LA UNIVERSIDAD (área expandida para considerarla destino/origen válido)
const UNIVERSITY_ZONE = {
  center: { lat: 4.7208, lng: -74.0555 },
  radius: 2000 // 2 km de radio
};

/**
 * Calcular distancia entre dos puntos usando fórmula de Haversine
 * @param {Object} point1 - { lat, lng }
 * @param {Object} point2 - { lat, lng }
 * @returns {number} Distancia en metros
 */
const calculateHaversineDistance = (point1, point2) => {
  const R = 6371000; // Radio de la tierra en metros
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * ✅ Validar si una coordenada está dentro de Cundinamarca
 * @param {Object} location - { lat, lng }
 * @returns {Object} { valid: boolean, message: string }
 */
const isLocationInCundinamarca = (location) => {
  if (!location || !location.lat || !location.lng) {
    return { valid: false, message: "Coordenadas inválidas" };
  }

  const { lat, lng } = location;

  if (
    lat < CUNDINAMARCA_BOUNDS.south ||
    lat > CUNDINAMARCA_BOUNDS.north ||
    lng < CUNDINAMARCA_BOUNDS.west ||
    lng > CUNDINAMARCA_BOUNDS.east
  ) {
    return {
      valid: false,
      message: `Ubicación fuera de Cundinamarca. Coordenadas: ${lat}, ${lng}`
    };
  }

  return { valid: true, message: "Ubicación válida dentro de Cundinamarca" };
};

/**
 * 🎓 Validar si una coordenada está dentro de la zona de la Universidad
 * @param {Object} location - { lat, lng }
 * @returns {boolean}
 */
const isInUniversityZone = (location) => {
  if (!location || !location.lat || !location.lng) {
    return false;
  }

  const distance = calculateHaversineDistance(UNIVERSITY_ZONE.center, location);
  return distance <= UNIVERSITY_ZONE.radius;
};

/**
 * 🚪 Encontrar entrada de universidad más cercana
 * @param {Object} location - { lat, lng }
 * @returns {Object|null} { entrance, distance } o null si está muy lejos
 */
const findNearestUniversityEntrance = (location) => {
  if (!location || !location.lat || !location.lng) {
    return null;
  }

  let nearest = null;
  let minDistance = Infinity;

  for (const entrance of UNIVERSITY_ENTRANCES) {
    const distance = calculateHaversineDistance(location, entrance);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = { entrance, distance };
    }
  }

  // Retornar solo si está dentro del radio de tolerancia de alguna entrada
  if (nearest && minDistance <= 500) {
    // 500 metros de tolerancia
    return nearest;
  }

  return null;
};

/**
 * 🎓 Validar si una ubicación es una entrada válida de la Universidad
 * @param {Object} location - { lat, lng, name }
 * @returns {Object} { isValidEntrance: boolean, entrance: Object|null, message: string }
 */
const validateUniversityEntrance = (location) => {
  if (!location || !location.lat || !location.lng) {
    return {
      isValidEntrance: false,
      entrance: null,
      message: "Coordenadas inválidas"
    };
  }

  for (const entrance of UNIVERSITY_ENTRANCES) {
    const distance = calculateHaversineDistance(location, entrance);
    if (distance <= entrance.radius) {
      return {
        isValidEntrance: true,
        entrance,
        distance,
        message: `Entrada válida de la Universidad: ${entrance.name}`
      };
    }
  }

  return {
    isValidEntrance: false,
    entrance: null,
    message: `Ubicación no corresponde a ninguna entrada de la Universidad. Entradas disponibles: ${UNIVERSITY_ENTRANCES.map((e) => e.name).join(", ")}`
  };
};

/**
 * 🚀 Validar ruta con reglas especiales para Universidad
 * @param {Object} origin - { lat, lng, name }
 * @param {Object} destination - { lat, lng, name }
 * @returns {Object} { valid: boolean, errors: string[] }
 */
const validateRouteWithUniversityRules = (origin, destination) => {
  const errors = [];

  // 1. Validar que ambas ubicaciones estén en Cundinamarca
  const originValid = isLocationInCundinamarca(origin);
  if (!originValid.valid) {
    errors.push(`Origen: ${originValid.message}`);
  }

  const destValid = isLocationInCundinamarca(destination);
  if (!destValid.valid) {
    errors.push(`Destino: ${destValid.message}`);
  }

  // 2. Si hay errores de ubicación, retornar aquí
  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const originInUniversityZone = isInUniversityZone(origin);
  const destInUniversityZone = isInUniversityZone(destination);

  // 3. Reglas especiales para la Universidad
  if (originInUniversityZone) {
    const entranceValidation = validateUniversityEntrance(origin);
    if (!entranceValidation.isValidEntrance) {
      errors.push(
        `Origen: Si sale de la Universidad, debe ser desde una entrada válida. ${entranceValidation.message}`
      );
    }
  }

  if (destInUniversityZone) {
    const entranceValidation = validateUniversityEntrance(destination);
    if (!entranceValidation.isValidEntrance) {
      errors.push(
        `Destino: Si va a la Universidad, debe llegar a una entrada válida. ${entranceValidation.message}`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    originInUniversityZone,
    destInUniversityZone
  };
};

/**
 * 🛑 Validar ubicación de recogida (para reservaciones)
 * @param {Object} pickupLocation - { lat, lng, name }
 * @param {Object} routeOrigin - { lat, lng }
 * @param {Object} routeDestination - { lat, lng }
 * @returns {Object} { valid: boolean, message: string }
 */
const validatePickupLocation = (
  pickupLocation,
  routeOrigin,
  routeDestination
) => {
  // Validar que esté en Cundinamarca
  const cundinamarcaCheck = isLocationInCundinamarca(pickupLocation);
  if (!cundinamarcaCheck.valid) {
    return cundinamarcaCheck;
  }

  // Validar reglas de Universidad si es necesario
  const pickupInUniv = isInUniversityZone(pickupLocation);
  if (pickupInUniv) {
    const entranceValidation = validateUniversityEntrance(pickupLocation);
    if (!entranceValidation.isValidEntrance) {
      return {
        valid: false,
        message: `Ubicación de recogida: Si está en la Universidad, debe ser en una entrada válida. ${entranceValidation.message}`
      };
    }
  }

  return { valid: true, message: "Ubicación de recogida válida" };
};

/**
 * 📋 Obtener lista de entradas de la Universidad
 * @returns {Array}
 */
const getUniversityEntrances = () => {
  return UNIVERSITY_ENTRANCES.map((entrance) => ({
    id: entrance.id,
    name: entrance.name,
    lat: entrance.lat,
    lng: entrance.lng
  }));
};

/**
 * 📊 Obtener información de los límites de Cundinamarca
 * @returns {Object}
 */
const getCundinamarcaBounds = () => {
  return {
    bounds: CUNDINAMARCA_BOUNDS,
    center: {
      lat: (CUNDINAMARCA_BOUNDS.north + CUNDINAMARCA_BOUNDS.south) / 2,
      lng: (CUNDINAMARCA_BOUNDS.east + CUNDINAMARCA_BOUNDS.west) / 2
    }
  };
};

module.exports = {
  // Utilidades de distancia
  calculateHaversineDistance,

  // Validaciones principales
  isLocationInCundinamarca,
  isInUniversityZone,
  validateUniversityEntrance,
  validateRouteWithUniversityRules,
  validatePickupLocation,

  // Búsqueda de ubicaciones
  findNearestUniversityEntrance,

  // Consultas de datos
  getUniversityEntrances,
  getCundinamarcaBounds,

  // Constantes
  UNIVERSITY_ENTRANCES,
  CUNDINAMARCA_BOUNDS,
  UNIVERSITY_ZONE
};

/**
 * ======================================
 * EJEMPLO DE INTEGRACIÓN - FRONT-END
 * Función de Optimización de Rutas
 * ======================================
 */

// ============================================
// 1. SERVICIO API PARA RUTAS
// ============================================

class RouteService {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  // Crear una nueva ruta
  async createRoute(routeData) {
    const response = await fetch(`${this.baseURL}/routes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(routeData)
    });
    return response.json();
  }

  // Obtener rutas disponibles
  async getAvailableRoutes() {
    const response = await fetch(`${this.baseURL}/routes/available`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }

  // Obtener detalles de una ruta
  async getRouteById(routeId) {
    const response = await fetch(`${this.baseURL}/routes/${routeId}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }

  // 🚀 INICIAR RUTA Y CALCULAR SECUENCIA ÓPTIMA
  async startRoute(routeId) {
    const response = await fetch(`${this.baseURL}/routes/${routeId}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      }
    });
    return response.json();
  }

  // 📊 OBTENER DETALLES DE LA RUTA OPTIMIZADA
  async getOptimizedRouteDetails(routeId) {
    const response = await fetch(`${this.baseURL}/routes/${routeId}/optimized`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }

  // Cancelar una ruta
  async cancelRoute(routeId) {
    const response = await fetch(`${this.baseURL}/routes/${routeId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    return response.json();
  }
}

// ============================================
// 2. COMPONENTE CONDUCTOR - INICIAR RUTA
// ============================================

class DriverRouteController {
  constructor(routeService) {
    this.routeService = routeService;
    this.currentRoute = null;
    this.optimizedPath = [];
    this.mapMarkers = [];
  }

  // Iniciar la ruta y mostrar secuencia optimizada
  async startCurrentRoute(routeId) {
    try {
      console.log(`📍 Iniciando ruta: ${routeId}`);

      // Llamar al endpoint para iniciar la ruta
      const response = await this.routeService.startRoute(routeId);

      if (response.error) {
        throw new Error(response.error);
      }

      this.currentRoute = response.route;
      this.optimizedPath = response.route.optimizedRoute;

      console.log('✅ Ruta iniciada exitosamente');
      console.log('📍 Orden de visitas:', this.optimizedPath);

      // Mostrar la ruta en el mapa
      this.displayRouteOnMap(this.optimizedPath);

      return {
        success: true,
        route: this.currentRoute,
        optimizedPath: this.optimizedPath
      };
    } catch (error) {
      console.error('❌ Error al iniciar ruta:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Obtener detalles de la ruta optimizada
  async getRouteInfo(routeId) {
    try {
      const details = await this.routeService.getOptimizedRouteDetails(
        routeId
      );

      console.log(`
        🗺️ DETALLES DE LA RUTA OPTIMIZADA
        =====================================
        Total de paradas: ${details.optimizedRoute.length - 2}
        Distancia total: ${details.totalDistanceKm} km
        Estado: ${details.status}
        Iniciada: ${new Date(details.startedAt).toLocaleString()}
      `);

      return details;
    } catch (error) {
      console.error('❌ Error al obtener detalles:', error.message);
      throw error;
    }
  }

  // Mostrar ruta en un mapa (ejemplo con Google Maps)
  displayRouteOnMap(optimizedPath) {
    // Limpiar marcadores anteriores
    this.mapMarkers.forEach(marker => marker.setMap(null));
    this.mapMarkers = [];

    // Crear marcadores para cada punto
    optimizedPath.forEach((point, index) => {
      const markerColors = {
        'origin': '#00ff00',      // Verde - Inicio
        'destination': '#ff0000', // Rojo - Fin
      };

      const color = point.type === 'origin'
        ? markerColors.origin
        : point.type === 'destination'
        ? markerColors.destination
        : '#0000ff'; // Azul - Paradas

      // Crear marcador (pseudocódigo - adaptar a tu librería)
      const marker = {
        position: { lat: point.lat, lng: point.lng },
        label: (index + 1).toString(),
        title: `${index + 1}. ${point.name}`,
        color: color,
        type: point.type
      };

      this.mapMarkers.push(marker);
      console.log(`  ${index + 1}. ${point.name} (${point.type})`);
    });

    return this.mapMarkers;
  }

  // Imprimir itinerario
  printItinerary() {
    console.log('\n📋 ITINERARIO DE LA RUTA');
    console.log('=' .repeat(50));

    this.optimizedPath.forEach((point, index) => {
      const emoji = point.type === 'origin'
        ? '🏠'
        : point.type === 'destination'
        ? '🎯'
        : '🚶';

      console.log(`${emoji} ${index}. ${point.name}`);
      console.log(`   📍 Lat: ${point.lat}, Lng: ${point.lng}`);
    });

    console.log('=' .repeat(50));
  }
}

// ============================================
// 3. COMPONENTE PASAJERO - HACER RESERVA
// ============================================

class PassengerService {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async makeReservation(routeId, pickupLocation) {
    try {
      const response = await fetch(`${this.baseURL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          routeId: routeId,
          pickupLocation: {
            name: pickupLocation.name,
            lat: pickupLocation.lat,
            lng: pickupLocation.lng
          }
        })
      });
      return response.json();
    } catch (error) {
      console.error('❌ Error al hacer reserva:', error);
      throw error;
    }
  }
}

// ============================================
// 4. EJEMPLO DE USO
// ============================================

// Inicializar servicios
const API_BASE_URL = 'http://localhost:3000';
const CONDUCTOR_TOKEN = 'token-del-conductor';
const PASSENGER_TOKEN = 'token-del-pasajero';

const routeService = new RouteService(API_BASE_URL, CONDUCTOR_TOKEN);
const passengerService = new PassengerService(API_BASE_URL, PASSENGER_TOKEN);
const driverController = new DriverRouteController(routeService);

// ========================
// FLUJO 1: CREAR RUTA
// ========================
async function createNewRoute() {
  const routeData = {
    origin: {
      name: 'Casa del conductor',
      lat: 4.7110,
      lng: -74.0721
    },
    destination: {
      name: 'Oficina Principal',
      lat: 4.7169,
      lng: -74.0894
    },
    departureTime: new Date(Date.now() + 3600000).toISOString(),
    totalSeats: 4
  };

  const route = await routeService.createRoute(routeData);
  console.log('✅ Ruta creada:', route._id);
  return route._id;
}

// ========================
// FLUJO 2: PASAJEROS HACEN RESERVAS
// ========================
async function passengersMakeReservations(routeId) {
  const pickupPoints = [
    { name: 'Centro Comercial', lat: 4.7125, lng: -74.0735 },
    { name: 'Estación de Metro', lat: 4.7115, lng: -74.0725 },
    { name: 'Parque Principal', lat: 4.7135, lng: -74.0745 }
  ];

  for (let i = 0; i < pickupPoints.length; i++) {
    try {
      const reservation = await passengerService.makeReservation(
        routeId,
        pickupPoints[i]
      );
      console.log(`✅ Pasajero ${i + 1} reservado en: ${pickupPoints[i].name}`);
    } catch (error) {
      console.error(`❌ Error al reservar pasajero ${i + 1}:`, error);
    }
  }
}

// ========================
// FLUJO 3: CONDUCTOR INICIA RUTA
// ========================
async function driverStartsRoute(routeId) {
  console.log('\n🚀 CONDUCTOR INICIANDO RUTA...\n');

  const result = await driverController.startCurrentRoute(routeId);

  if (result.success) {
    // Mostrar itinerario
    driverController.printItinerary();

    // Obtener información detallada
    const details = await driverController.getRouteInfo(routeId);
    console.log('\n📊 Información detallada:', details);
  }
}

// ========================
// EJECUTAR EJEMPLO COMPLETO
// ========================
async function runCompleteExample() {
  console.log('🎯 INICIANDO EJEMPLO DE FLUJO COMPLETO\n');

  try {
    // 1. Crear ruta
    const routeId = await createNewRoute();

    // 2. Esperar a que pasajeros hagan reservas (simulado)
    await new Promise(resolve => setTimeout(resolve, 2000));
    await passengersMakeReservations(routeId);

    // 3. Conductor inicia la ruta
    await new Promise(resolve => setTimeout(resolve, 2000));
    await driverStartsRoute(routeId);

    console.log('\n✅ EJEMPLO COMPLETADO EXITOSAMENTE');
  } catch (error) {
    console.error('\n❌ ERROR EN EL EJEMPLO:', error);
  }
}

// Descomentar para ejecutar:
// runCompleteExample();

// ============================================
// 5. EXPORTAR PARA USO EN MÓDULOS
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RouteService,
    PassengerService,
    DriverRouteController,
    runCompleteExample
  };
}

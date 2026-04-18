# 🗺️ Función de Optimización de Rutas

## Descripción General

Se ha implementado una función avanzada de optimización de rutas que calcula automáticamente la mejor secuencia de paradas para minimizar la distancia total recorrida. Utiliza el **algoritmo del Vecino Más Cercano (Nearest Neighbor)** para resolver el problema del vendedor viajero (TSP - Traveling Salesman Problem).

## 📊 Componentes Implementados

### 1. **Modelo de Datos Actualizado**

#### `Route.js`
```javascript
{
  origin: { name, lat, lng },           // Salida (domicilio conductor)
  destination: { name, lat, lng },      // Destino final
  stops: [                               // Paradas intermedias
    { 
      passengerId, 
      name, 
      lat, 
      lng, 
      order, 
      visitedAt 
    }
  ],
  optimizedRoute: [                      // Ruta optimizada (secuencia calculada)
    { 
      type: 'origin' | 'stop-{id}' | 'destination',
      lat, 
      lng, 
      name, 
      order, 
      visitOrder 
    }
  ],
  status: 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
  startedAt: Date,
  completedAt: Date
}
```

#### `Reservation.js`
```javascript
{
  routeId: ObjectId,
  passengerId: String,
  pickupLocation: {                      // Ubicación de recogida
    name: String,
    lat: Number,
    lng: Number
  },
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED'
}
```

### 2. **Algoritmo de Optimización**

**Función: `optimizeRoute(origin, destination, stops)`**

Utiliza el **algoritmo del Vecino Más Cercano** para optimizar la ruta:

1. Comienza en el punto de origen (domicilio del conductor)
2. Encuentra la parada más cercana y la visita
3. Desde esa parada, encuentra la siguiente más cercana
4. Continúa hasta visitar todas las paradas
5. Finaliza en el punto de destino

**Complejidad:** O(n²)
**Ventaja:** Rápido y produce resultados cercanos al óptimo

### 3. **Nuevos Endpoints**

#### **POST** `/routes/:id/start`
Inicia la ruta y calcula la mejor secuencia de paradas.

**Autenticación:** ✅ Requerida
**Request:**
```json
{
  // No requiere body - usa el ID de la ruta
}
```

**Response:**
```json
{
  "message": "Route started successfully with optimized sequence",
  "route": {
    "_id": "route-id",
    "driverId": "driver-id",
    "origin": { "name": "Casa del conductor", "lat": 4.7110, "lng": -74.0721 },
    "destination": { "name": "Oficina", "lat": 4.7169, "lng": -74.0894 },
    "optimizedRoute": [
      { "type": "origin", "order": 0, "lat": 4.7110, "lng": -74.0721, "name": "Casa del conductor" },
      { "type": "stop-passenger1", "order": 1, "lat": 4.7120, "lng": -74.0730, "name": "Recogida 1" },
      { "type": "stop-passenger2", "order": 2, "lat": 4.7130, "lng": -74.0740, "name": "Recogida 2" },
      { "type": "destination", "order": 3, "lat": 4.7169, "lng": -74.0894, "name": "Oficina" }
    ],
    "status": "IN_PROGRESS",
    "startedAt": "2026-04-17T10:30:00Z"
  }
}
```

#### **GET** `/routes/:id/optimized`
Obtiene detalles de la ruta optimizada incluyendo distancia total.

**Autenticación:** ✅ Requerida
**Response:**
```json
{
  "routeId": "route-id",
  "driverId": "driver-id",
  "optimizedRoute": [ /* array de puntos en orden */ ],
  "totalDistance": 15340,           // en metros
  "totalDistanceKm": "15.34",       // en kilómetros
  "status": "IN_PROGRESS",
  "startedAt": "2026-04-17T10:30:00Z",
  "stops": [ /* array de paradas */ ],
  "origin": { "name": "Casa", "lat": 4.7110, "lng": -74.0721 },
  "destination": { "name": "Oficina", "lat": 4.7169, "lng": -74.0894 }
}
```

## 🚀 Flujo de Uso

### 1. **Crear una ruta**
```bash
POST /routes
Content-Type: application/json
Authorization: Bearer {token}

{
  "origin": {
    "name": "Casa del conductor",
    "lat": 4.7110,
    "lng": -74.0721
  },
  "destination": {
    "name": "Oficina",
    "lat": 4.7169,
    "lng": -74.0894
  },
  "departureTime": "2026-04-17T09:00:00Z",
  "totalSeats": 4
}
```

### 2. **Pasajeros hacen reservaciones**
```bash
POST /reservations
Content-Type: application/json
Authorization: Bearer {token}

{
  "routeId": "route-id",
  "pickupLocation": {
    "name": "Centro Comercial",
    "lat": 4.7125,
    "lng": -74.0735
  }
}
```

### 3. **Conductor inicia la ruta**
Cuando el conductor está listo para partir, llamará al endpoint `/routes/:id/start`:

```bash
POST /routes/{routeId}/start
Authorization: Bearer {conductor-token}
```

El sistema automáticamente:
- Obtiene todas las reservaciones confirmadas
- Calcula la mejor secuencia de paradas
- Guarda la ruta optimizada en la base de datos
- Cambia el estado a `IN_PROGRESS`

### 4. **Consultar detalles de la ruta optimizada**
```bash
GET /routes/{routeId}/optimized
Authorization: Bearer {conductor-token}
```

Retorna:
- La secuencia completa de puntos a visitar
- Distancia total en metros y kilómetros
- Estado actual de la ruta

## 📐 Cálculo de Distancias

La distancia se calcula usando la **fórmula de Haversine** (implementada por la librería `geolib`), que calcula la distancia en línea recta entre dos coordenadas GPS.

```javascript
const distance = calculateDistance(point1, point2);
// Retorna la distancia en metros
```

## 💡 Ejemplos de Uso en el Cliente

### JavaScript/React
```javascript
// 1. Iniciar la ruta
const startRoute = async (routeId) => {
  const response = await fetch(`/routes/${routeId}/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await response.json();
  console.log('Ruta optimizada:', data.route.optimizedRoute);
  return data;
};

// 2. Obtener detalles
const getRouteDetails = async (routeId) => {
  const response = await fetch(`/routes/${routeId}/optimized`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// 3. Mostrar en mapa (con Google Maps)
const displayRoute = (optimizedRoute) => {
  const coordinates = optimizedRoute.map(point => ({
    lat: point.lat,
    lng: point.lng,
    label: point.order,
    title: point.name
  }));
  
  // Mostrar markers en orden
  coordinates.forEach(coord => {
    new google.maps.Marker({
      position: coord,
      map: map,
      label: coord.label.toString(),
      title: coord.title
    });
  });
};
```

## 🔄 Transición de Estados

```
ACTIVE
  ↓
  (Conductor llama POST /routes/:id/start)
  ↓
IN_PROGRESS
  ↓
  (Conductor completa todas las paradas)
  ↓
COMPLETED

O en cualquier momento:
ACTIVE/IN_PROGRESS
  ↓
  (Conductor cancela)
  ↓
CANCELLED
```

## ⚙️ Configuración Requerida

### Dependencias Instaladas
- `geolib` - Cálculo de distancias GPS

### Variables de Entorno
No se requieren nuevas variables de entorno.

## 📈 Métricas Disponibles

Por cada ruta optimizada se puede obtener:
- **Distancia Total:** En metros y kilómetros
- **Número de Paradas:** Cantidad de pasajeros a recoger
- **Tiempo Estimado:** Basado en velocidad promedio
- **Orden de Visita:** Secuencia optimizada de puntos

## 🔐 Autorización

Todos los endpoints nuevos requieren autenticación. Solo el conductor propietario de la ruta puede:
- Iniciar la ruta (`POST /routes/:id/start`)
- Ver detalles optimizados (`GET /routes/:id/optimized`)
- Cancelar la ruta (`DELETE /routes/:id`)

## 🐛 Manejo de Errores

```javascript
// Errores comunes:

// 1. Route not found
{ error: "Route not found" } // 404

// 2. Unauthorized
{ error: "Unauthorized" } // 401

// 3. Route is not active
{ error: "Route is not active" } // 400

// 4. Route has not been started yet
{ error: "Route has not been started yet" } // 400
```

## 📝 Notas Implementación

1. **Algoritmo:** Se utiliza Nearest Neighbor por su velocidad O(n²)
2. **Precisión:** Adecuado para rutas con hasta 500+ paradas
3. **Distancia:** Calculada en línea recta (Haversine), no considera tráfico
4. **Estado:** Se mantiene sincronizado en base de datos

## 🚀 Mejoras Futuras

- [ ] Integración con Google Maps Directions API para distancias reales
- [ ] Considerar horarios de tráfico
- [ ] Algoritmo genético para optimización más precisa
- [ ] Restricciones de ventanas de tiempo
- [ ] Soporte para múltiples conductores

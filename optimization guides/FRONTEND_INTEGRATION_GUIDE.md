# 📱 Guía de Integración Frontend - Mostrar Ruta Optimizada

## 🎯 Ubicaciones Recomendadas para Mostrar la Ruta

### 1. **Pantalla de Conductor - Detalles de Ruta**

#### Ubicación: `/driver/routes/{routeId}`

**Estructura sugerida:**
```
┌─────────────────────────────────────────┐
│  Detalles de la Ruta                    │
├─────────────────────────────────────────┤
│                                         │
│  🚀 [Iniciar Ruta]                      │  ← Botón para iniciar
│                                         │
├─────────────────────────────────────────┤
│  📊 Información de la Ruta              │
│  ├─ Distancia: 15.3 km                  │
│  ├─ Paradas: 5                          │
│  ├─ Estado: IN_PROGRESS                 │
│  └─ Iniciada: 17/04/2026 10:30          │
├─────────────────────────────────────────┤
│  📍 Mapa de la Ruta                     │
│  │                                     │
│  │    [Mapa Interactivo]               │
│  │    (Google Maps o Leaflet)          │
│  │                                     │
├─────────────────────────────────────────┤
│  📋 Orden de Paradas                    │
│  1. 🏠 Casa - (4.7110, -74.0721)        │
│  2. 🚶 Centro Comercial - (4.7125...)   │
│  3. 🚶 Estación Metro - (4.7115...)     │
│  4. 🚶 Parque - (4.7135...)             │
│  5. 🎯 Oficina - (4.7169...)            │
│                                         │
│  🔄 [Recargar] 📥 [Descargar]           │
└─────────────────────────────────────────┘
```

**Implementación React:**
```jsx
import { DriverStartRoute, OptimizedRouteDisplay } from './components/routes';

function DriverRoutePage({ routeId }) {
  return (
    <div>
      <h1>Detalles de la Ruta</h1>
      <DriverStartRoute routeId={routeId} />
      <OptimizedRouteDisplay routeId={routeId} />
    </div>
  );
}
```

---

### 2. **Pantalla de Pasajero - Confirmación de Recogida**

#### Ubicación: `/passenger/reservation/{reservationId}`

**Estructura sugerida:**
```
┌─────────────────────────────────────────┐
│  Mi Recogida                            │
├─────────────────────────────────────────┤
│                                         │
│  ✅ Reserva Confirmada                  │
│  Ruta: #A1B2C3                          │
│  Conductor: Juan García                 │
│                                         │
├─────────────────────────────────────────┤
│  📍 Ubicación de Recogida               │
│  Centro Comercial                       │
│  Coordenadas: (4.7125, -74.0735)        │
│                                         │
├─────────────────────────────────────────┤
│  🗺️ Mapa de la Ruta                     │
│  │                                     │
│  │    [Mapa con mi parada resaltada]   │
│  │                                     │
│  │    Tu parada: 🚶 (#2)               │
│  │    Orden de recogida del conductor  │
│  │                                     │
├─────────────────────────────────────────┤
│  ⏱️ Tiempo Estimado                      │
│  Recogida en: 15 minutos                │
│  Distancia a la parada: 2.3 km          │
│                                         │
│  📞 [Contactar Conductor]               │
│  📱 [Compartir Ubicación]               │
│  📲 [Obtener Indicaciones]              │
└─────────────────────────────────────────┘
```

**Implementación React:**
```jsx
import { GoogleMap, Marker } from '@react-google-maps/api';

function PassengerReservationPage({ reservationId, routeId }) {
  const [route, setRoute] = useState(null);
  const [passengerStop, setPassengerStop] = useState(null);

  useEffect(() => {
    fetchRoute(routeId).then(data => {
      setRoute(data);
      // Encontrar la parada del pasajero
      const myStop = data.optimizedRoute.find(
        stop => stop.passengerId === passengerId
      );
      setPassengerStop(myStop);
    });
  }, [routeId]);

  if (!route) return <div>Cargando...</div>;

  return (
    <div>
      <h2>Tu Ubicación de Recogida</h2>
      
      {/* Mapa */}
      <GoogleMap center={{ lat: route.origin.lat, lng: route.origin.lng }} zoom={13}>
        {/* Mostrar todas las paradas */}
        {route.optimizedRoute.map((point, idx) => (
          <Marker
            key={idx}
            position={{ lat: point.lat, lng: point.lng }}
            icon={{
              fillColor: point.passengerId === passengerId ? 'red' : 'blue'
            }}
          />
        ))}
      </GoogleMap>

      {/* Información */}
      <div className="info">
        <p>Tu parada: {passengerStop?.order + 1} de {route.optimizedRoute.length}</p>
        <p>Distancia total de la ruta: {route.totalDistanceKm} km</p>
      </div>
    </div>
  );
}
```

---

### 3. **Dashboard de Conductor - Rutas Activas**

#### Ubicación: `/driver/dashboard`

**Estructura sugerida:**
```
┌────────────────────────────────────────────────────────────────┐
│  Mis Rutas Activas                                             │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Ruta #1 - 15.3 km - 5 paradas - EN PROGRESO            │ │
│  │                                                          │ │
│  │  Paradas completadas: 2/5                               │ │
│  │  Próxima parada: Centro Comercial (500 m)              │ │
│  │                                                          │ │
│  │  [Ver Mapa] [Detalles] [Rastreo en Vivo]              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Ruta #2 - 8.7 km - 3 paradas - ACTIVA                  │ │
│  │                                                          │ │
│  │  Estado: Pendiente de iniciar                           │ │
│  │  Pasajeros confirmados: 3                               │ │
│  │                                                          │ │
│  │  [🚀 Iniciar] [Ver Detalles]                            │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**Implementación React:**
```jsx
function DriverDashboard() {
  const [activeRoutes, setActiveRoutes] = useState([]);

  useEffect(() => {
    fetchDriverRoutes().then(setActiveRoutes);
  }, []);

  return (
    <div>
      <h1>Mis Rutas Activas</h1>
      {activeRoutes.map(route => (
        <RouteCard key={route._id} route={route} />
      ))}
    </div>
  );
}

function RouteCard({ route }) {
  return (
    <div className="route-card">
      <h3>Ruta #{route._id.slice(0, 5)} - {route.totalDistanceKm} km</h3>
      <p>Paradas: {route.optimizedRoute.length - 2}</p>
      
      {route.status === 'ACTIVE' && (
        <button onClick={() => startRoute(route._id)}>
          🚀 Iniciar Ruta
        </button>
      )}
      
      {route.status === 'IN_PROGRESS' && (
        <OptimizedRouteDisplay routeId={route._id} />
      )}
    </div>
  );
}
```

---

### 4. **Pantalla de Rastreo en Vivo**

#### Ubicación: `/tracking/{routeId}`

**Estructura sugerida:**
```
┌──────────────────────────────────────────────────────────────┐
│  Rastreo de Ruta en Vivo                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Conductor: Juan García 📍 Ubicación: En ruta               │
│  Próxima parada: Centro Comercial (500 m, 3 min)            │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │        [Mapa con rastreo en tiempo real]              │ │
│  │        🚗 Conductor (ubicación actual)                │ │
│  │        🏁 Próxima parada                              │ │
│  │        🎯 Destino final                               │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Paradas Completadas:                                        │
│  ✅ Casa del conductor                                       │
│  ✅ Estación de Metro - Juan (14:30)                         │
│  ⏳ Centro Comercial - María (próximo)                       │
│  ⏳ Parque - Pedro                                           │
│  ⏳ Oficina - Destino final                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Implementación React con WebSocket:**
```jsx
function LiveTracking({ routeId }) {
  const [driverLocation, setDriverLocation] = useState(null);
  const [route, setRoute] = useState(null);

  useEffect(() => {
    // Conectar WebSocket para ubicación en tiempo real
    const ws = new WebSocket('ws://localhost:3000/tracking');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.routeId === routeId) {
        setDriverLocation(data.location);
      }
    };

    return () => ws.close();
  }, [routeId]);

  return (
    <div>
      <h1>Rastreo en Vivo</h1>
      
      {/* Mapa con ubicación del conductor */}
      <GoogleMap center={driverLocation || defaultCenter} zoom={14}>
        {/* Marcador del conductor */}
        {driverLocation && (
          <Marker
            position={driverLocation}
            icon="🚗"
            label="Conductor"
          />
        )}
        
        {/* Marcadores de paradas */}
        {route?.optimizedRoute.map((point, idx) => (
          <Marker key={idx} position={{ lat: point.lat, lng: point.lng }} />
        ))}
      </GoogleMap>

      {/* Lista de paradas */}
      <ol>
        {route?.optimizedRoute.map((point, idx) => (
          <li key={idx}>
            {point.visited ? '✅' : '⏳'} {point.name}
          </li>
        ))}
      </ol>
    </div>
  );
}
```

---

### 5. **Vista Administrativa - Estadísticas de Rutas**

#### Ubicación: `/admin/statistics`

**Estructura sugerida:**
```
┌──────────────────────────────────────────────────────────────┐
│  Estadísticas de Rutas - Hoy                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Rutas Totales: 12 │ Completadas: 8 │ En Progreso: 3       │
│  Paradas Totales: 42 │ Completadas: 35 │ Pendientes: 7     │
│  Distancia Total: 128.5 km                                  │
│  Ahorro vs Sin Optimizar: 12.3 km (10%)                     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Ruta Mejor Optimizada:                                      │
│  #A1B2C3 - 8.5 km (5 paradas)                               │
│  Ahorro: 1.2 km vs ruta random                              │
│                                                              │
│  Ruta Más Larga:                                             │
│  #X9Y8Z7 - 23.4 km (12 paradas)                             │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔗 Datos Necesarios en Cada Sección

### Para Mostrar la Ruta Necesitas:

```javascript
{
  // De la API /routes/{id}/optimized:
  
  optimizedRoute: [
    {
      type: "origin" | "stop-{id}" | "destination",
      lat: Number,
      lng: Number,
      name: String,
      order: Number,
      passengerId: String  // opcional, solo para stops
    }
  ],
  
  totalDistance: Number,      // en metros
  totalDistanceKm: String,    // en km
  status: String,             // "IN_PROGRESS", "COMPLETED"
  startedAt: Date
}
```

---

## 🛠️ Stack Recomendado por Tecnología

### **React**
```bash
npm install @react-google-maps/api axios
```

Archivo de ejemplo: `FRONTEND_INTEGRATION_REACT.js`

### **Vue 3**
```bash
npm install vue-3-google-map axios
```

Archivo de ejemplo: `FRONTEND_INTEGRATION_VUE.vue`

### **HTML Vanilla (sin dependencias)**

Archivo de ejemplo: `FRONTEND_DISPLAY_ROUTE.html`

---

## 📋 Checklist de Integración

- [ ] Crear servicio API para obtener rutas
- [ ] Instalar librería de mapas (Google Maps o Leaflet)
- [ ] Crear componente para mostrar mapa
- [ ] Crear componente para lista de paradas
- [ ] Crear componente para información resumida
- [ ] Integrar en página de detalles de ruta (conductor)
- [ ] Integrar en página de confirmación (pasajero)
- [ ] Integrar en dashboard (conductor)
- [ ] Agregar rastreo en tiempo real (opcional)
- [ ] Agregar estadísticas administrativas (opcional)
- [ ] Pruebas en diferentes dispositivos
- [ ] Optimizar rendimiento de mapa

---

## 🎨 Personalización de Colores

```css
/* Colores recomendados */
--primary: #667eea        /* Azul */
--success: #4CAF50        /* Verde para inicio */
--warning: #FFC107        /* Amarillo para en progreso */
--danger: #f44336         /* Rojo para parada final */
--info: #2196F3           /* Azul para información */

/* Colores de marcadores */
--origin: #00ff00         /* Verde para origen */
--stop: #0000ff           /* Azul para paradas */
--destination: #ff0000    /* Rojo para destino */
```

---

## 📱 Responsive Design

```css
/* Mobile */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  .map-container {
    height: 300px;
  }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

---

## 🔄 Flujo de Actualización de Datos

```
Conductor inicia ruta
        │
        ├─► PUT /routes/{id}/start
        │
        ├─► API retorna ruta optimizada
        │
        ├─► Frontend recibe datos
        │
        ├─► Mostrar en mapa
        │
        ├─► Mostrar lista de paradas
        │
        ├─► WebSocket escucha cambios
        │
        └─► Actualizar posición del conductor en tiempo real
```

---

## ⚙️ Variables de Entorno Necesarias

```env
# Frontend
VITE_API_URL=http://localhost:3000
REACT_APP_GOOGLE_MAPS_API_KEY=tu-api-key
REACT_APP_MAPBOX_TOKEN=tu-mapbox-token

# Backend
GOOGLE_MAPS_API_KEY=tu-api-key
```

---

## 📞 Soporte

Consulta estos archivos para más detalles:
- `FRONTEND_INTEGRATION_REACT.js` - Ejemplo React completo
- `FRONTEND_INTEGRATION_VUE.vue` - Ejemplo Vue completo
- `FRONTEND_DISPLAY_ROUTE.html` - Ejemplo HTML vanilla
- `ROUTE_OPTIMIZATION_EXAMPLE.js` - Ejemplos de uso de API

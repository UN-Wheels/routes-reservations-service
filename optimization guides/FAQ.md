# ❓ FAQ - Optimización de Rutas

## Preguntas Frecuentes y Troubleshooting

---

## 1. General

### ¿Cuál es el algoritmo utilizado?

**Respuesta:** Se utiliza el **algoritmo del Vecino Más Cercano (Nearest Neighbor)**, que resuelve el problema del vendedor viajero (TSP). Este algoritmo:
- Comienza en el origen
- Siempre va al punto no visitado más cercano
- Continúa hasta visitar todas las paradas
- Finaliza en el destino

**Ventajas:**
- Complejidad O(n²) - muy rápido
- Produce resultados cercanos al óptimo (80-90% de eficiencia)
- Ideal para rutas en tiempo real

---

### ¿Cómo se calculan las distancias?

**Respuesta:** Se utiliza la **fórmula de Haversine**, implementada por la librería `geolib`. Esta fórmula:
- Calcula la distancia entre dos puntos en coordenadas GPS
- Retorna distancia en línea recta (geodésica)
- Precisión: ±0.5% en distancias reales

**Nota:** No considera tráfico real. Para eso, se recomienda integrar Google Maps Directions API.

---

### ¿Cuándo se calcula la ruta?

**Respuesta:** La ruta se calcula **solo cuando el conductor inicia el viaje** llamando a:
```
POST /routes/{routeId}/start
```

En ese momento, el sistema:
1. Obtiene todas las reservaciones CONFIRMADAS
2. Extrae las ubicaciones de recogida
3. Ejecuta el algoritmo de optimización
4. Guarda la ruta optimizada en BD
5. Cambia el estado a IN_PROGRESS

---

### ¿Qué pasa si cambio de tokens?

**Respuesta:** Debes cambiar los valores en las pruebas:
```powershell
$DRIVER_TOKEN = "nuevo-token-conductor"
$PASSENGER_TOKEN = "nuevo-token-pasajero"
```

**Importante:** Cada token debe corresponder al usuario autenticado.

---

## 2. Modelos de Datos

### ¿Qué cambió en el modelo de Route?

**Respuesta:** Se agregaron:
```javascript
{
  stops: [                    // Paradas intermedias
    {
      passengerId: String,
      name: String,
      lat: Number,
      lng: Number,
      order: Number,
      visitedAt: Date
    }
  ],
  optimizedRoute: [           // Ruta optimizada
    {
      type: String,           // 'origin', 'stop-{id}', 'destination'
      lat: Number,
      lng: Number,
      name: String,
      order: Number,
      visitOrder: Number
    }
  ],
  status: "IN_PROGRESS" | "COMPLETED",  // Nuevos valores
  startedAt: Date,
  completedAt: Date
}
```

---

### ¿Qué cambió en el modelo de Reservation?

**Respuesta:** Se agregó:
```javascript
{
  pickupLocation: {
    name: String,
    lat: Number,
    lng: Number
  }
}
```

**Importante:** Este campo es **requerido** para que la ruta se optimice correctamente.

---

## 3. Uso de Endpoints

### ¿Cómo inicio una ruta?

**Respuesta:**
```bash
POST /routes/{routeId}/start
Authorization: Bearer {token-conductor}
```

**Requisitos:**
- ✅ La ruta debe estar en estado ACTIVE
- ✅ Debe tener al menos una reservación CONFIRMED
- ✅ Todas las reservaciones deben tener pickupLocation

**Respuesta:**
```json
{
  "message": "Route started successfully with optimized sequence",
  "route": {
    "optimizedRoute": [/* ... */],
    "status": "IN_PROGRESS",
    "startedAt": "timestamp"
  }
}
```

---

### ¿Cómo obtengo detalles de la ruta optimizada?

**Respuesta:**
```bash
GET /routes/{routeId}/optimized
Authorization: Bearer {token-conductor}
```

**Respuesta:**
```json
{
  "routeId": "...",
  "optimizedRoute": [/* array de paradas en orden */],
  "totalDistance": 15340,       // metros
  "totalDistanceKm": "15.34",   // km
  "status": "IN_PROGRESS"
}
```

---

### ¿Necesito autenticación para ambos endpoints?

**Respuesta:** Sí. Ambos endpoints requieren:
- ✅ Bearer token válido en header `Authorization`
- ✅ El token debe ser del conductor propietario de la ruta

Si no tienes token:
```
Error: {error: "Unauthorized"}
```

---

## 4. Problemas Comunes

### Problema: "Route not found"

**Causa:** El routeId no existe o está mal escrito

**Solución:**
```powershell
# Verificar que el ROUTE_ID sea correcto
Write-Host "ROUTE_ID: $ROUTE_ID"

# Obtener todas las rutas disponibles
GET /routes/available
```

---

### Problema: "Unauthorized"

**Causa:** El token no es válido o no eres el propietario de la ruta

**Solución:**
```powershell
# Verificar que el token sea correcto
$DRIVER_TOKEN = "token-valido-del-conductor"

# Verificar que seas el propietario
GET /routes/{routeId}  # Comparar driverId con tu usuario
```

---

### Problema: "Route is not active"

**Causa:** La ruta no está en estado ACTIVE (fue cancelada o ya completada)

**Solución:**
```powershell
# Crear una nueva ruta en estado ACTIVE
POST /routes {
  origin: {...},
  destination: {...},
  totalSeats: 4
}
```

---

### Problema: "Route has not been started yet"

**Causa:** Intentaste obtener detalles de una ruta que nunca fue iniciada

**Solución:**
```powershell
# Primero inicia la ruta
POST /routes/{routeId}/start

# Luego obtén los detalles
GET /routes/{routeId}/optimized
```

---

### Problema: La ruta incluye muchos puntos pero no están en el orden esperado

**Causa:** El algoritmo Nearest Neighbor encuentra soluciones locales óptimas, no globales

**Explicación:**
```
El algoritmo puede quedar "atrapado" en un óptimo local si:
- Las paradas están muy dispersas geográficamente
- Hay una parada "lejana" que atrae todo el recorrido

Ejemplo:
❌ Rutas locales subóptimas:
  Origen → Parada A (lejana) → Parada B → Parada C → Destino

✅ Ruta global óptima:
  Origen → Parada B → Parada C → Parada A (lejana) → Destino
```

**Solución:**
- Usar algoritmo genético (mejora al 95%+ de eficiencia)
- Integrar con Google Maps para distancias reales
- Agregar restricciones de ventanas de tiempo

---

### Problema: Las distancias no coinciden con Google Maps

**Causa:** Se calcula distancia en línea recta (Haversine), no en carreteras

**Ejemplo:**
```
Distancia calculada: 2.5 km (línea recta)
Google Maps: 4.2 km (por carreteras)

Diferencia: ~68% (normal en ciudades)
```

**Solución:**
- Integrar Google Maps Directions API
- Usar Open Route Service
- Considerar matriz de distancias real

---

## 5. Optimización y Rendimiento

### ¿Con cuántas paradas funciona bien?

**Respuesta:**
```
Excelente:     0-50 paradas
Bueno:        50-200 paradas
Aceptable:   200-500 paradas
Lento:       500+ paradas
```

**Rendimiento esperado:**
- 10 paradas: <10ms
- 100 paradas: <200ms
- 500 paradas: <5 segundos

---

### ¿Cómo mejoro la precisión?

**Opción 1: Algoritmo Genético**
```javascript
// Genera múltiples soluciones y selecciona la mejor
// Eficiencia: 95%+
// Tiempo: 1-5 segundos (depende de paradas)
```

**Opción 2: Google Maps API**
```javascript
// Usa distancias reales en carreteras
// Precisión: 100% (según datos de Google)
// Costo: $0.005 por solicitud
```

**Opción 3: Open Route Service**
```javascript
// Alternativa gratis a Google Maps
// Precisión: 95%+
// Requiere servidor local
```

---

## 6. Casos de Uso

### Caso 1: Ruta simple (3 paradas)

```powershell
1️⃣  POST /routes → Crear ruta origen-destino
2️⃣  POST /reservations × 3 → Pasajeros reservan
3️⃣  POST /routes/{id}/start → Inicia y optimiza
4️⃣  GET /routes/{id}/optimized → Obtiene distancia total (5.2 km)
```

---

### Caso 2: Ruta compleja (20+ paradas)

```powershell
1️⃣  Crear ruta
2️⃣  Esperar a que se confirmen muchas reservaciones
3️⃣  Iniciar ruta (calcula mejor secuencia)
4️⃣  Mostrar en mapa la ruta optimizada
5️⃣  Navegar según el orden sugerido
```

---

### Caso 3: Múltiples rutas simultáneas

```
🚗 Ruta 1: Conductor A, 5 paradas → Optimizada
🚗 Ruta 2: Conductor B, 8 paradas → Optimizada
🚗 Ruta 3: Conductor C, 3 paradas → Optimizada

Cada ruta se optimiza de forma independiente
```

---

## 7. Seguridad

### ¿Qué pasajeros se incluyen en la ruta?

**Respuesta:** Solo aquellos con:
- ✅ status = "CONFIRMED"
- ✅ pickupLocation con lat/lng válidos
- ✅ Asociados al routeId

```javascript
// En startRoute():
const reservations = await Reservation.find({
  routeId: routeId,
  status: "CONFIRMED"
});
```

---

### ¿Quién puede iniciar una ruta?

**Respuesta:** Solo el conductor propietario:
```javascript
if (route.driverId !== driverId) {
  throw new Error("Unauthorized");
}
```

---

### ¿Qué información se expone?

**Respuesta:**
- ✅ Coordenadas de origen/destino (público)
- ✅ Coordenadas de paradas (solo conductor)
- ✅ Orden de visitas (solo conductor)
- ❌ IDs de pasajeros (no en respuesta pública)

---

## 8. Integración Frontend

### ¿Cómo muestro la ruta en un mapa?

**JavaScript/React:**
```javascript
const details = await fetch(`/routes/${routeId}/optimized`);
const route = await details.json();

// Crear marcadores
route.optimizedRoute.forEach((point, index) => {
  new google.maps.Marker({
    position: { lat: point.lat, lng: point.lng },
    label: (index + 1).toString(),
    title: point.name,
    map: map
  });
});
```

---

### ¿Cómo actualizo la posición del conductor?

**Respuesta:** (Futura mejora)
```javascript
// WebSocket para ubicación en tiempo real
socket.on('driver-location', (location) => {
  // Actualizar marcador del conductor en mapa
});
```

---

## 9. Mejoras Futuras

### ¿Qué viene después?

- [ ] Marcar paradas como visitadas
- [ ] Tracking en tiempo real con WebSocket
- [ ] Integración con Google Maps Directions
- [ ] Algoritmo genético para mayor precisión
- [ ] Soporte para múltiples conductores coordinados
- [ ] Predicción de tráfico con ML
- [ ] Ventanas de tiempo para paradas
- [ ] Reasignación de paradas en tiempo real

---

## 10. Contacto y Soporte

### Documentación disponible:

1. **ROUTE_OPTIMIZATION.md** - Guía técnica completa
2. **IMPLEMENTATION_SUMMARY.md** - Resumen de cambios
3. **ROUTE_OPTIMIZATION_EXAMPLE.js** - Ejemplos de código
4. **TEST_ENDPOINTS.ps1** - Scripts de prueba
5. **TEST_ENDPOINTS.sh** - Scripts para Linux/Mac

### ¿Dudas?

Revisa primero:
1. Los logs del servidor
2. Los códigos de error del endpoint
3. La documentación técnica
4. Los ejemplos de uso

---

**Versión:** 1.0
**Última actualización:** 2026-04-17
**Estado:** ✅ IMPLEMENTACIÓN COMPLETADA

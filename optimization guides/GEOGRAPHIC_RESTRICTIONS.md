# 🗺️ Restricciones Geográficas - Guía de Implementación

## Resumen de Restricciones Implementadas

### ✅ 1. Límites de Cundinamarca
El sistema ahora valida que **todas las ubicaciones (origen, destino, puntos de recogida)** estén dentro de los límites del departamento de Cundinamarca, Colombia.

**Coordenadas de límites:**
- **Norte**: 5.8°
- **Sur**: 3.5°
- **Este**: -73.0°
- **Oeste**: -75.5°

**Error si está fuera:**
```
"Ubicación fuera de Cundinamarca. Coordenadas: X, Y"
```

---

### 🎓 2. Reglas Especiales para la Universidad Nacional

#### Entradas Válidas de la Universidad:
```json
{
  "entrances": [
    {
      "id": "u-entrance-1",
      "name": "Entrada Principal - Cra 30 con Calle 45",
      "lat": 4.7208,
      "lng": -74.0555
    },
    {
      "id": "u-entrance-2",
      "name": "Entrada Sur - Cra 30 con Calle 39",
      "lat": 4.7158,
      "lng": -74.0555
    },
    {
      "id": "u-entrance-3",
      "name": "Entrada Oriente - Cra 45 con Calle 45",
      "lat": 4.7208,
      "lng": -74.0447
    },
    {
      "id": "u-entrance-4",
      "name": "Entrada Occidente - Cra 30 con Calle 45 (Medicina)",
      "lat": 4.7230,
      "lng": -74.0570
    }
  ]
}
```

#### Reglas:
- ✅ Si salida está **dentro de la Universidad** → Debe ser desde **UNA de las entradas**
- ✅ Si destino está **dentro de la Universidad** → Debe ser a **UNA de las entradas**
- ✅ Si recogida está **dentro de la Universidad** → Debe ser desde **UNA de las entradas**

**Error si no cumple:**
```
"Si sale de la Universidad, debe ser desde una entrada válida"
"Si va a la Universidad, debe llegar a una entrada válida"
```

---

## 📌 Endpoints Nuevos

### 1. Obtener Entradas de la Universidad
```http
GET /routes/geo/university-entrances
```

**Respuesta:**
```json
{
  "message": "Entradas de la Universidad Nacional de Colombia",
  "entrances": [
    {
      "id": "u-entrance-1",
      "name": "Entrada Principal - Cra 30 con Calle 45",
      "lat": 4.7208,
      "lng": -74.0555
    }
    // ... más entradas
  ],
  "totalEntrances": 4
}
```

### 2. Obtener Límites de Cundinamarca
```http
GET /routes/geo/cundinamarca-bounds
```

**Respuesta:**
```json
{
  "message": "Límites geográficos del departamento de Cundinamarca",
  "bounds": {
    "north": 5.8,
    "south": 3.5,
    "east": -73.0,
    "west": -75.5
  },
  "center": {
    "lat": 4.65,
    "lng": -74.25
  }
}
```

---

## 🚀 Cómo Usar

### Caso 1: Crear una Ruta Normal (Dentro de Cundinamarca)
```javascript
POST /routes
Authorization: Bearer <token>

{
  "origin": {
    "name": "Centro Comercial Unicentro",
    "lat": 4.7300,
    "lng": -74.0500
  },
  "destination": {
    "name": "Centro Comercial Andino",
    "lat": 4.6500,
    "lng": -74.0700
  },
  "departureTime": "2026-05-01T08:00:00Z",
  "pricePerSeat": 5000,
  "vehicleId": "vehicle-123"
}
```

✅ **Acepta**: Ambas ubicaciones dentro de Cundinamarca

❌ **Rechaza**: 
- Si una ubicación está fuera de Cundinamarca
- Si hay coordenadas inválidas

---

### Caso 2: Ruta hacia la Universidad
```javascript
POST /routes
Authorization: Bearer <token>

{
  "origin": {
    "name": "Centro de la Ciudad",
    "lat": 4.7000,
    "lng": -74.0600
  },
  "destination": {
    "name": "Universidad Nacional",
    "lat": 4.7208,  // Dentro de la zona de la U
    "lng": -74.0555 // Debe coincidir con una entrada
  },
  "departureTime": "2026-05-01T08:00:00Z",
  "pricePerSeat": 3000,
  "vehicleId": "vehicle-123"
}
```

✅ **Acepta**: Si destino es una entrada válida (hasta 500m de tolerancia)

❌ **Rechaza**: 
- Si coordenadas están dentro de la U pero NO en una entrada
- Error: "Si va a la Universidad, debe llegar a una entrada válida"

---

### Caso 3: Salir desde la Universidad
```javascript
POST /routes
Authorization: Bearer <token>

{
  "origin": {
    "name": "Universidad Nacional",
    "lat": 4.7158,  // Entrada Sur
    "lng": -74.0555
  },
  "destination": {
    "name": "Centro Comercial",
    "lat": 4.6000,
    "lng": -74.0800
  },
  "departureTime": "2026-05-01T17:00:00Z",
  "pricePerSeat": 3000,
  "vehicleId": "vehicle-123"
}
```

✅ **Acepta**: Si origen es una entrada válida

❌ **Rechaza**: 
- Si origen está dentro de la U pero NO es una entrada
- Error: "Si sale de la Universidad, debe ser desde una entrada válida"

---

### Caso 4: Solicitar Reserva con Punto de Recogida

```javascript
POST /reservations
Authorization: Bearer <token>

{
  "routeId": "route-123",
  "travelDate": "2026-05-01",
  "pickupLocation": {
    "name": "Mi casa",
    "lat": 4.7100,
    "lng": -74.0650
  }
}
```

✅ **Acepta**: Si `pickupLocation` está dentro de Cundinamarca y sigue reglas de la U

❌ **Rechaza**:
- Si está fuera de Cundinamarca
- Si está en la U pero NO en una entrada
- Error: "Ubicación de recogida: Si está en la Universidad, debe ser en una entrada válida"

---

## 🔧 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `src/utils/geographicUtils.js` | ✨ **NUEVO**: Utilidades geográficas y validaciones |
| `src/services/routeService.js` | Importa validaciones y valida en `createRoute` y `updateRoute` |
| `src/services/reservationService.js` | Valida `pickupLocation` en `requestReservation` |
| `src/controllers/routeController.js` | Maneja errores geográficos, agrega endpoints `/geo/*` |
| `src/controllers/reservationController.js` | Envía `pickupLocation`, maneja errores geográficos |
| `src/routes/routeRoutes.js` | Agrega rutas `/geo/university-entrances` y `/geo/cundinamarca-bounds` |

---

## 🧪 Ejemplos de Prueba (cURL)

### Obtener entradas de la Universidad
```bash
curl -X GET http://localhost:3000/routes/geo/university-entrances
```

### Obtener límites de Cundinamarca
```bash
curl -X GET http://localhost:3000/routes/geo/cundinamarca-bounds
```

### Crear ruta que será RECHAZADA (fuera de Cundinamarca)
```bash
curl -X POST http://localhost:3000/routes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"name": "Quito", "lat": 0.2193, "lng": -78.5123},
    "destination": {"name": "Bogotá", "lat": 4.7110, "lng": -74.0055},
    "departureTime": "2026-05-01T08:00:00Z",
    "pricePerSeat": 5000
  }'
```

**Respuesta:**
```json
{
  "error": "Origen: Ubicación fuera de Cundinamarca. Coordenadas: 0.2193, -78.5123"
}
```

### Crear ruta VÁLIDA a la Universidad
```bash
curl -X POST http://localhost:3000/routes \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"name": "Centro", "lat": 4.7000, "lng": -74.0600},
    "destination": {"name": "Universidad Nacional", "lat": 4.7208, "lng": -74.0555},
    "departureTime": "2026-05-01T08:00:00Z",
    "pricePerSeat": 3000
  }'
```

---

## 📝 Configuración (Personalizable)

Edita `src/utils/geographicUtils.js` para:

### Cambiar entradas de la Universidad
```javascript
const UNIVERSITY_ENTRANCES = [
  {
    id: "u-entrance-1",
    name: "Tu entrada",
    lat: 4.7208,
    lng: -74.0555,
    radius: 150 // metros de tolerancia
  }
  // ... agregar más
];
```

### Cambiar límites de Cundinamarca
```javascript
const CUNDINAMARCA_BOUNDS = {
  north: 5.8,
  south: 3.5,
  east: -73.0,
  west: -75.5
};
```

### Cambiar radio de la zona de la Universidad
```javascript
const UNIVERSITY_ZONE = {
  center: { lat: 4.7208, lng: -74.0555 },
  radius: 2000 // 2 km
};
```

---

## 💡 Casos de Uso

### ✅ Siempre Válidos
- ✓ Bogotá → Medellín (ambas en Cundinamarca)
- ✓ Casa → Universidad (entrada válida)
- ✓ Universidad (entrada) → Oficina
- ✓ Centro comercial → Centro comercial

### ❌ Siempre Rechazados
- ✗ Quito (Ecuador) → Bogotá
- ✗ Bogotá → Miami (fuera de Colombia)
- ✗ Calle aleatoria en Campus → Centro (no es entrada)
- ✗ Casa → Patio de la Universidad (no es entrada)

---

## 🎯 Próximos Pasos (Opcional)

1. **Agregar más universidades**: Crear constantes similares para otras universidades
2. **Integrar Google Maps API**: Para validar distancias reales (no solo Haversine)
3. **Permitir múltiples zonas especiales**: Parques, hospitales, etc.
4. **Agregar API para gestionar entradas**: Endpoint para CRUD de entradas

---

## ❓ FAQ

**P: ¿Qué pasa si alguien intenta entrar a la Universidad por un punto que no es entrada?**
R: El sistema rechaza la solicitud con error 400. Debe usar una de las 4 entradas oficiales.

**P: ¿Puedo cambiar las coordenadas de las entradas?**
R: Sí, edita `UNIVERSITY_ENTRANCES` en `src/utils/geographicUtils.js`.

**P: ¿Qué tan precisas son las validaciones?**
R: Usa Fórmula de Haversine (±0.5% de error). Para mayor precisión, integra Google Maps API.

**P: ¿Funciona en otros departamentos?**
R: No. Necesitarías extender el código para otros departamentos. Este es solo para Cundinamarca.

---

**Creado**: 28 de abril de 2026
**Última actualización**: 28 de abril de 2026

# 📅 Disponibilidad Opcional para Rutas - Guía de Implementación

## 🎯 Cambios Realizados

A partir de ahora, la disponibilidad de rutas es **completamente opcional**. Las rutas se mostrarán en el frontend incluso sin tener fechas específicas o recurrentes asignadas.

### Antes (Comportamiento Anterior)
```
Ruta CREADA → SIN SLOTS → NO VISIBLE EN FRONTEND ❌
Ruta CREADA → CON SLOTS → VISIBLE EN FRONTEND ✅
```

### Ahora (Nuevo Comportamiento)
```
Ruta CREADA → SIN SLOTS → VISIBLE EN FRONTEND ✅
Ruta CREADA → CON SLOTS → VISIBLE EN FRONTEND ✅
```

---

## 📝 Lógica de Filtrado Actualizada

### Archivo Modificado
- **src/services/routeService.js** → `getRoutes()` (líneas 223-254)

### Nueva Lógica
```javascript
// Una ruta será visible si:
1. Está en estado ACTIVE, Y
2. Cumple CUALQUIERA de estas condiciones:
   a) NO tiene slots asignados (sin disponibilidad configurada)
   b) Tiene slots con cupos disponibles (disponibilidad configurada)

// Una ruta NO será visible si:
- Está en estado INACTIVE, O
- Está activa pero NO tiene slots Y TODOS sus slots tienen 0 cupos
```

---

## 🖥️ Impacto en el Frontend

### 1. **Mostrar Rutas sin Configuración**
Ahora el frontend recibirá rutas que aún no tienen disponibilidad configurada.

```javascript
// Respuesta de GET /routes
[
  {
    _id: "123",
    origin: { name: "Bogotá", lat: 4.7110, lng: -74.0721 },
    destination: { name: "Medellín", lat: 6.2442, lng: -75.5812 },
    pricePerSeat: 50000,
    status: "ACTIVE",
    // ⚠️ NOTA: Esta ruta NO tiene slots aún, pero SE MUESTRA
  },
  {
    _id: "456",
    origin: { name: "Bogotá", lat: 4.7110, lng: -74.0721 },
    destination: { name: "Cali", lat: 3.4372, lng: -76.5197 },
    pricePerSeat: 45000,
    status: "ACTIVE",
    // Esta ruta SÍ tiene slots con disponibilidad
  }
]
```

### 2. **Indicador Visual de Disponibilidad Pendiente**
Se recomienda mostrar un indicador cuando una ruta no tiene disponibilidad configurada:

```jsx
function RouteCard({ route }) {
  const slots = useRouteSlots(route._id); // GET /routes/{id}/slots
  const hasAvailability = slots && slots.length > 0;

  return (
    <div className="route-card">
      <h3>{route.origin.name} → {route.destination.name}</h3>
      
      {!hasAvailability ? (
        <div className="availability-pending">
          ⏳ Disponibilidad no configurada
          <small>El conductor aún debe asignar fechas</small>
        </div>
      ) : (
        <div className="availability-ok">
          ✅ {slots.length} fechas disponibles
        </div>
      )}

      <p>💵 ${route.pricePerSeat}</p>
    </div>
  );
}
```

### 3. **Manejo de Reservas en Rutas sin Disponibilidad**
Cuando un usuario intenta reservar en una ruta sin slots:

```javascript
// GET /routes/{id}/slots
// Respuesta: [] (array vacío)

// Mostrar mensaje al usuario:
"Esta ruta aún no tiene disponibilidad configurada.
 Por favor, intenta más tarde o selecciona otra ruta."
```

---

## 🔄 Flujo de Usuario (Pasajero)

### Escenario: Buscar Rutas
1. Usuario abre app de reservas
2. Llama a `GET /routes` 
3. Recibe **todas las rutas activas** (con o sin disponibilidad)
4. Ve la ruta, pero nota "⏳ Disponibilidad pendiente"
5. Intenta reservar → `GET /routes/{id}/slots` → sin slots
6. App muestra: "Vuelve pronto cuando el conductor configure fechas"

---

## 🎮 Flujo de Usuario (Conductor)

### Escenario: Crear y Configurar Ruta
1. Conductor crea ruta
2. **Ruta inmediatamente visible** en `GET /routes` ✨
3. Conductor entra a detalles de la ruta
4. Configura disponibilidad (fechas fijas o recurrentes)
5. Ruta ahora tiene slots: `POST /routes/{id}/availability`
6. Pasajeros pueden reservar

---

## 📊 Endpoint: GET /routes/slots

**Comportamiento Actualizado:**
```javascript
// GET /routes/{id}/slots?from=2026-05-01&to=2026-05-15

// Si la ruta SIN slots:
Response: [] // Array vacío

// Si la ruta CON slots:
Response: [
  {
    date: "2026-05-05T00:00:00Z",
    totalSeats: 4,
    usedSeats: 2,
    availableSeats: 2
  },
  // ...más slots
]
```

---

## ✅ Recomendaciones de Implementación

### Para Pasajeros (Frontend Consumer)
```jsx
// 1. Mostrar todas las rutas
const routes = await fetch('/routes').then(r => r.json());

// 2. Para cada ruta, verificar disponibilidad
for (const route of routes) {
  const slots = await fetch(`/routes/${route._id}/slots`);
  route.hasSlots = slots.length > 0;
}

// 3. Indicar visualmente cuáles están disponibles
routes.forEach(r => {
  if (r.hasSlots) {
    // Mostrar botón "RESERVAR"
  } else {
    // Mostrar "⏳ Próximamente"
  }
});
```

### Para Conductores (Backend)
No requiere cambios. El sistema automáticamente:
- ✅ Muestra rutas sin configuración
- ✅ Mantiene rutas con slots configurados
- ✅ Filtra rutas inactivas

---

## 🚨 Casos Edge a Considerar

### 1. Ruta sin slots pero con pasajeros reservados
**¿Puede pasar?** No. La lógica de negocio requiere slots para crear reservas.

### 2. Cambiar ruta de ACTIVE → INACTIVE
Se dejan de mostrar en listado público automáticamente.

### 3. Eliminar todos los slots de una ruta
La ruta permanecerá visible en listado (comportamiento nuevo).

---

## 📞 API Reference

| Endpoint | Antes | Ahora |
|----------|-------|-------|
| `GET /routes` | Solo rutas con slots | **Todas las rutas activas** |
| `GET /routes/{id}` | Sin cambios | Sin cambios |
| `GET /routes/{id}/slots` | Devuelve slots | Devuelve `[]` si sin slots |
| `POST /routes/{id}/availability` | Sin cambios | Sin cambios |

---

## 🎓 Ejemplo Completo: Frontend React

```jsx
import React, { useState, useEffect } from 'react';

function RoutesList() {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    const loadRoutes = async () => {
      const response = await fetch('http://localhost:3000/routes');
      const data = await response.json();
      setRoutes(data);
    };
    loadRoutes();
  }, []);

  return (
    <div>
      {routes.map(route => (
        <RouteCard key={route._id} route={route} />
      ))}
    </div>
  );
}

function RouteCard({ route }) {
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  useEffect(() => {
    const loadSlots = async () => {
      const response = await fetch(
        `http://localhost:3000/routes/${route._id}/slots`
      );
      const data = await response.json();
      setSlots(data);
      setLoadingSlots(false);
    };
    loadSlots();
  }, [route._id]);

  return (
    <div className="card">
      <h3>{route.origin.name} → {route.destination.name}</h3>
      <p>💵 ${route.pricePerSeat}</p>
      
      {loadingSlots ? (
        <p>Cargando...</p>
      ) : slots.length > 0 ? (
        <button onClick={() => reserve(route._id)}>
          ✅ RESERVAR ({slots.length} fechas)
        </button>
      ) : (
        <p className="pending">⏳ Disponibilidad no configurada</p>
      )}
    </div>
  );
}
```

---

## ✨ Conclusión

**Los cambios realizados permiten que:**
- ✅ Las rutas sean visibles desde el momento de su creación
- ✅ La configuración de disponibilidad sea completamente opcional
- ✅ Los conductores tengan control sobre cuándo mostrar cupos
- ✅ Los pasajeros puedan explorar rutas en desarrollo

**El frontend debe estar preparado para:**
- 🔍 Mostrar todas las rutas activas
- 📍 Indicar si una ruta tiene o no disponibilidad
- 🚫 Manejar intento de reserva en ruta sin slots

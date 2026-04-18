# 📱 Resumen para Equipo de Frontend

## 🎯 ¿Qué es la Ruta Optimizada?

El backend ahora calcula automáticamente la **mejor secuencia de paradas** cuando un conductor inicia una ruta. Tu tarea en el frontend es **mostrar** esa secuencia al usuario.

---

## 📊 Datos que Recibes del Backend

Cuando llamas a `GET /routes/{id}/optimized`, recibes esto:

```json
{
  "routeId": "123abc",
  "optimizedRoute": [
    {
      "type": "origin",
      "order": 0,
      "lat": 4.7110,
      "lng": -74.0721,
      "name": "Casa del conductor"
    },
    {
      "type": "stop-passenger1",
      "order": 1,
      "lat": 4.7125,
      "lng": -74.0735,
      "name": "Centro Comercial",
      "passengerId": "passenger1"
    },
    {
      "type": "destination",
      "order": 2,
      "lat": 4.7169,
      "lng": -74.0894,
      "name": "Oficina"
    }
  ],
  "totalDistance": 3340,
  "totalDistanceKm": "3.34",
  "status": "IN_PROGRESS",
  "startedAt": "2026-04-18T10:30:00Z"
}
```

---

## 🔴 Secciones Donde Mostrar la Ruta

### 1. **Para Conductores** (Sección Principal)

**URL:** `/driver/routes/{routeId}`

Mostrar:
- ✅ Botón **"🚀 Iniciar Ruta"** (si aún no está iniciada)
- ✅ Mapa con la ruta (si ya está iniciada)
- ✅ Lista numerada de paradas en orden
- ✅ Distancia total en km
- ✅ Estado de la ruta

**Prioridad:** 🔴 ALTA - Es lo más importante

---

### 2. **Para Pasajeros** (Confirmación de Recogida)

**URL:** `/passenger/reservation/{id}`

Mostrar:
- ✅ Mapa con tu parada resaltada
- ✅ Tu número de parada en el orden (ej: "Parada 2 de 5")
- ✅ Distancia total de la ruta
- ✅ Información del conductor
- ✅ Botón para contactar conductor

**Prioridad:** 🟡 MEDIA - Importante para experiencia

---

### 3. **Dashboard de Conductor** (Vista General)

**URL:** `/driver/dashboard`

Mostrar:
- ✅ Lista de rutas activas
- ✅ Para cada ruta: distancia, paradas, estado
- ✅ Botón para ver detalles/mapa

**Prioridad:** 🟡 MEDIA

---

### 4. **Rastreo en Vivo** (Opcional Futuro)

**URL:** `/tracking/{routeId}`

Mostrar:
- ✅ Ubicación del conductor en tiempo real
- ✅ Paradas completadas vs pendientes
- ✅ Próxima parada y distancia

**Prioridad:** 🟢 BAJA - Para más adelante

---

## 📋 Pasos de Implementación

### Paso 1: Obtener los Datos

```javascript
// Cuando el usuario llega a la página de detalles
const routeId = 'xxx';
const response = await fetch(
  `http://localhost:3000/routes/${routeId}/optimized`,
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);
const route = await response.json();
```

### Paso 2: Mostrar en Mapa

```javascript
// Usar Google Maps o Leaflet
// Dibujar línea entre todos los puntos
// Agregar marcadores numerados (1, 2, 3, etc)
```

### Paso 3: Mostrar Lista

```javascript
// Crear lista HTML/React con cada parada
// 1. Casa - Verde (origen)
// 2. Centro Comercial - Azul
// 3. Oficina - Rojo (destino)
```

### Paso 4: Mostrar Información

```javascript
// Distancia total: 3.34 km
// Paradas: 2
// Estado: IN_PROGRESS
```

---

## 🚀 Para Iniciar Ruta

Cuando el conductor toca el botón "Iniciar Ruta":

```javascript
// 1. Llamar endpoint
POST /routes/{id}/start

// 2. Backend retorna ruta optimizada
// 3. Tu código la muestra en el mapa

// Flujo:
Usuario toca "Iniciar" 
    → POST /start 
    → Backend calcula secuencia 
    → Retorna datos 
    → Tu mapa los muestra
```

---

## 🎨 Elementos Visuales Recomendados

### Mapa
- Fondo: Gris claro
- Línea de ruta: Azul (#0066cc) - Grosor 3px
- Marcadores: Números dentro de círculos

### Marcadores por Tipo
```
🏠 Origen (1)           → Verde     (#00ff00)
🚶 Parada intermedia    → Azul      (#0000ff)
🎯 Destino              → Rojo      (#ff0000)
```

### Información
- Fondo gris suave (#f0f0f0)
- Tarjetas blancas con borde azul
- Números grandes y bold para distancia

---

## 📱 Donde Conseguir Ejemplos de Código

Te dejé estos archivos listos para copiar/pegar:

| Tecnología | Archivo |
|------------|---------|
| React | `FRONTEND_INTEGRATION_REACT.js` |
| Vue 3 | `FRONTEND_INTEGRATION_VUE.vue` |
| HTML Vanilla | `FRONTEND_DISPLAY_ROUTE.html` |
| Code Snippets | `FRONTEND_CODE_SNIPPETS.md` |
| Guía Completa | `FRONTEND_INTEGRATION_GUIDE.md` |

---

## 🔑 API Key de Google Maps

Necesitarás una API Key. Pasos:

1. Ir a Google Cloud Console
2. Crear proyecto
3. Habilitar "Maps JavaScript API"
4. Crear credencial (API Key)
5. Agregar a tu `.env`

```env
REACT_APP_GOOGLE_MAPS_API_KEY=tu-api-key-aqui
```

---

## 🧪 Prueba Rápida (Sin Mapa)

Para probar SIN Google Maps (solo para desarrollo):

```jsx
function SimpleRouteTest({ routeId }) {
  const [route, setRoute] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:3000/routes/${routeId}/optimized`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(setRoute);
  }, []);

  if (!route) return 'Cargando...';

  return (
    <div>
      <h2>Distancia: {route.totalDistanceKm} km</h2>
      <ol>
        {route.optimizedRoute.map((p, i) => (
          <li key={i}>{p.name}</li>
        ))}
      </ol>
    </div>
  );
}
```

✅ ¡Esto ya funciona sin Google Maps!

---

## ⚠️ Errores Comunes

### Error: "Unauthorized"
**Causa:** Token inválido o expirado
**Solución:** Verificar que el token esté en localStorage

### Error: "Route not found"
**Causa:** RouteId no existe
**Solución:** Verificar que uses el routeId correcto

### Mapa no aparece
**Causa:** API Key inválida o no configurada
**Solución:** Revisar `.env` y Google Cloud Console

### Marcadores no se ven
**Causa:** Coordenadas inválidas
**Solución:** Verificar que lat/lng sean números válidos

---

## 📞 Preguntas Frecuentes

### ¿Cuándo se calcula la ruta?
Cuando el conductor toca "Iniciar Ruta" → `POST /routes/{id}/start`

### ¿Dónde obtengo los datos?
De `GET /routes/{id}/optimized` (después de iniciada)

### ¿Necesito actualizar cada X segundos?
No, los datos son estáticos. Solo actualiza si el conductor inicia de nuevo.

### ¿Puedo usar Leaflet en lugar de Google Maps?
Sí, es más simple y gratis. Solo cambia la librería de mapas.

### ¿Los pasajeros ven la ruta optimizada?
Sí, en su página de confirmación. Ven su parada y el orden completo.

---

## ✅ Checklist Final

- [ ] Entiendo qué datos recibo del backend
- [ ] Tengo los archivos de ejemplo descargados
- [ ] Elegí una librería de mapa (Google Maps o Leaflet)
- [ ] Tengo configurada la API Key
- [ ] Implementé componente para mostrar ruta
- [ ] Probé en navegador
- [ ] Pasó pruebas de:
  - [ ] Conductor iniciando ruta
  - [ ] Mostrar en mapa
  - [ ] Mostrar lista de paradas
  - [ ] Mostrar distancia total
  - [ ] Responsive en mobile

---

## 📚 Documentación Relacionada

- `ROUTE_OPTIMIZATION.md` - Detalles técnicos backend
- `FRONTEND_INTEGRATION_GUIDE.md` - Guía completa de integración
- `FRONTEND_CODE_SNIPPETS.md` - Código listo para copiar
- `FAQ.md` - Preguntas frecuentes

---

## 🚀 Próximos Pasos

1. **Esta semana:** Mostrar ruta en mapa simple
2. **Próxima semana:** Agregar validaciones y manejo de errores
3. **Futuro:** Rastreo en tiempo real con WebSocket

---

**¿Preguntas? Revisar los archivos documentación.** 

Tengo todo listo para que puedas integrar. ¡Adelante! 💪

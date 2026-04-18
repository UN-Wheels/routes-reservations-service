# 📋 Snippets de Código Listos para Usar

## 🚀 Copia y Pega en tu Proyecto

---

## 1️⃣ REACT - Componente Simple

```jsx
// src/components/OptimizedRoute.jsx

import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';

export function OptimizedRoute({ routeId }) {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3000/routes/${routeId}/optimized`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(setRoute)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [routeId]);

  if (loading) return <div>Cargando...</div>;
  if (!route) return <div>Sin datos</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>🗺️ Ruta: {route.totalDistanceKm} km</h2>

      <LoadScript googleMapsApiKey="YOUR_API_KEY">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '400px' }}
          center={{ lat: route.origin.lat, lng: route.origin.lng }}
          zoom={13}
        >
          <Polyline
            path={route.optimizedRoute.map(p => ({ lat: p.lat, lng: p.lng }))}
            options={{ strokeColor: '#0066cc', strokeWeight: 3 }}
          />

          {route.optimizedRoute.map((point, i) => (
            <Marker
              key={i}
              position={{ lat: point.lat, lng: point.lng }}
              label={(i + 1).toString()}
            />
          ))}
        </GoogleMap>
      </LoadScript>

      <h3>Paradas:</h3>
      <ol>
        {route.optimizedRoute.map((p, i) => (
          <li key={i}>{p.name}</li>
        ))}
      </ol>
    </div>
  );
}
```

**Usar así:**
```jsx
import { OptimizedRoute } from './components/OptimizedRoute';

function App() {
  return <OptimizedRoute routeId="123abc" />;
}
```

---

## 2️⃣ VUE 3 - Componente Simple

```vue
<!-- src/components/OptimizedRoute.vue -->

<template>
  <div class="route-container">
    <h2>🗺️ Ruta: {{ route?.totalDistanceKm }} km</h2>

    <div v-if="loading" class="loading">Cargando...</div>

    <div v-else-if="route">
      <!-- Mapa -->
      <GoogleMap
        :api-key="'YOUR_API_KEY'"
        style="width: 100%; height: 400px"
        :center="{ lat: route.origin.lat, lng: route.origin.lng }"
        :zoom="13"
      >
        <Polyline
          :path="route.optimizedRoute.map(p => ({ lat: p.lat, lng: p.lng }))"
          :options="{ strokeColor: '#0066cc', strokeWeight: 3 }"
        />

        <Marker
          v-for="(point, i) in route.optimizedRoute"
          :key="i"
          :position="{ lat: point.lat, lng: point.lng }"
          :label="(i + 1).toString()"
        />
      </GoogleMap>

      <!-- Paradas -->
      <h3>Paradas:</h3>
      <ol>
        <li v-for="(p, i) in route.optimizedRoute" :key="i">
          {{ p.name }}
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { GoogleMap, Marker, Polyline } from 'vue-3-google-map';

const props = defineProps({
  routeId: String
});

const route = ref(null);
const loading = ref(true);

onMounted(async () => {
  const r = await fetch(
    `http://localhost:3000/routes/${props.routeId}/optimized`,
    {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }
  );
  route.value = await r.json();
  loading.value = false;
});
</script>

<style scoped>
.route-container {
  padding: 20px;
}
</style>
```

**Usar así:**
```vue
<OptimizedRoute :routeId="routeId" />
```

---

## 3️⃣ JAVASCRIPT VANILLA - Función Simple

```javascript
// js/route-display.js

async function displayRoute(routeId, containerSelector) {
  const container = document.querySelector(containerSelector);

  try {
    // Obtener ruta
    const response = await fetch(
      `http://localhost:3000/routes/${routeId}/optimized`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );

    const route = await response.json();

    // HTML del mapa (placeholder)
    const mapHtml = `
      <div style="border: 1px solid #ccc; padding: 20px; height: 400px; margin: 20px 0;">
        Mapa: ${route.optimizedRoute.length} puntos
      </div>
    `;

    // HTML de paradas
    const stopsHtml = route.optimizedRoute
      .map((p, i) => `<li>${i + 1}. ${p.name} (${p.lat.toFixed(4)}, ${p.lng.toFixed(4)})</li>`)
      .join('');

    // Renderizar
    container.innerHTML = `
      <h2>🗺️ Ruta: ${route.totalDistanceKm} km</h2>
      ${mapHtml}
      <h3>Paradas:</h3>
      <ol>${stopsHtml}</ol>
    `;
  } catch (error) {
    container.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
  }
}

// Usar:
displayRoute('123abc', '#route-container');
```

---

## 4️⃣ INICIAR RUTA - Botón

```javascript
// Función para iniciar ruta (React)
async function handleStartRoute(routeId) {
  const response = await fetch(
    `http://localhost:3000/routes/${routeId}/start`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );

  const data = await response.json();
  console.log('Ruta iniciada:', data.route.optimizedRoute);
  // Mostrar la ruta optimizada
  displayRoute(routeId);
}
```

```jsx
// En React:
<button onClick={() => handleStartRoute(routeId)}>
  🚀 Iniciar Ruta
</button>
```

---

## 5️⃣ TABLA DE PARADAS - Componente React

```jsx
function StopsTable({ optimizedRoute }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #0066cc' }}>
          <th>Orden</th>
          <th>Ubicación</th>
          <th>Coordenadas</th>
          <th>Tipo</th>
        </tr>
      </thead>
      <tbody>
        {optimizedRoute.map((point, index) => (
          <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '10px' }}>{index + 1}</td>
            <td style={{ padding: '10px' }}>{point.name}</td>
            <td style={{ padding: '10px' }}>
              {point.lat.toFixed(4)}, {point.lng.toFixed(4)}
            </td>
            <td style={{ padding: '10px' }}>
              {point.type === 'origin' ? '🏠' : point.type === 'destination' ? '🎯' : '🚶'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 6️⃣ INFORMACIÓN RESUMIDA - Card React

```jsx
function RouteInfo({ route }) {
  return (
    <div style={{
      background: '#f0f0f0',
      padding: '20px',
      borderRadius: '8px',
      marginBottom: '20px'
    }}>
      <h3>📊 Información</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <strong>Distancia:</strong> {route.totalDistanceKm} km
        </div>
        <div>
          <strong>Paradas:</strong> {route.optimizedRoute.length - 2}
        </div>
        <div>
          <strong>Estado:</strong> {route.status}
        </div>
        <div>
          <strong>Iniciada:</strong> {new Date(route.startedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
```

---

## 7️⃣ MAPA CON LEAFLET (Alternativa a Google Maps)

```jsx
// npm install leaflet react-leaflet

import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';

function MapWithLeaflet({ route }) {
  const points = route.optimizedRoute.map(p => [p.lat, p.lng]);

  return (
    <MapContainer center={[route.origin.lat, route.origin.lng]} zoom={13} style={{ height: '400px', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* Línea de ruta */}
      <Polyline positions={points} color="blue" weight={3} />

      {/* Marcadores */}
      {route.optimizedRoute.map((point, i) => (
        <Marker key={i} position={[point.lat, point.lng]}>
          <Popup>{i + 1}. {point.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
```

---

## 8️⃣ DESCARGAR RUTA COMO JSON

```javascript
function downloadRoute(route) {
  const dataStr = JSON.stringify(route, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const exportFileDefaultName = `ruta-${route._id}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

// Usar:
// <button onClick={() => downloadRoute(route)}>📥 Descargar</button>
```

---

## 9️⃣ SERVICIO API REUTILIZABLE (TypeScript)

```typescript
// services/routeService.ts

interface OptimizedRoute {
  routeId: string;
  optimizedRoute: {
    type: string;
    lat: number;
    lng: number;
    name: string;
    order: number;
  }[];
  totalDistance: number;
  totalDistanceKm: string;
  status: string;
}

class RouteService {
  private apiUrl = 'http://localhost:3000';

  private getToken(): string {
    return localStorage.getItem('token') || '';
  }

  async getOptimizedRoute(routeId: string): Promise<OptimizedRoute> {
    const response = await fetch(
      `${this.apiUrl}/routes/${routeId}/optimized`,
      {
        headers: { Authorization: `Bearer ${this.getToken()}` }
      }
    );
    return response.json();
  }

  async startRoute(routeId: string) {
    const response = await fetch(
      `${this.apiUrl}/routes/${routeId}/start`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.getToken()}`
        }
      }
    );
    return response.json();
  }
}

export const routeService = new RouteService();
```

**Usar:**
```typescript
import { routeService } from './services/routeService';

const route = await routeService.getOptimizedRoute('123abc');
```

---

## 🔟 CONFIGURACIÓN GLOBAL (React Context)

```jsx
// context/RouteContext.jsx

import { createContext, useContext, useState } from 'react';

const RouteContext = createContext();

export function RouteProvider({ children }) {
  const [currentRoute, setCurrentRoute] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadRoute = async (routeId) => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3000/routes/${routeId}/optimized`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setCurrentRoute(await response.json());
    } finally {
      setLoading(false);
    }
  };

  return (
    <RouteContext.Provider value={{ currentRoute, loading, loadRoute }}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoute() {
  return useContext(RouteContext);
}
```

**Usar:**
```jsx
function MyComponent() {
  const { currentRoute, loading, loadRoute } = useRoute();

  return (
    <div>
      <button onClick={() => loadRoute('123abc')}>Cargar</button>
      {loading && <p>Cargando...</p>}
      {currentRoute && <p>Distancia: {currentRoute.totalDistanceKm} km</p>}
    </div>
  );
}
```

---

## 🎨 ESTILOS LISTOS - Tailwind CSS

```jsx
// tailwind.config.js ya debe tener esto

module.exports = {
  theme: {
    extend: {}
  }
};

// Componente con Tailwind:
function RouteCard({ route }) {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🗺️ Ruta Optimizada</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <p className="text-sm text-gray-600">Distancia</p>
          <p className="text-2xl font-bold text-blue-600">{route.totalDistanceKm} km</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <p className="text-sm text-gray-600">Paradas</p>
          <p className="text-2xl font-bold text-green-600">{route.optimizedRoute.length - 2}</p>
        </div>
      </div>

      <ol className="space-y-2">
        {route.optimizedRoute.map((point, i) => (
          <li key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
            <span className="font-bold text-blue-600">{i + 1}.</span>
            <span>{point.name}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
```

---

## ✅ Checklist de Integración Rápida

- [ ] Copiar servicio API a tu proyecto
- [ ] Agregar Google Maps API Key a .env
- [ ] Instalar dependencias (`npm install @react-google-maps/api`)
- [ ] Copiar componente a tu proyecto
- [ ] Probar en navegador
- [ ] Agregar autenticación
- [ ] Integrar en página de detalles
- [ ] Probar en dispositivo móvil
- [ ] Optimizar rendimiento

---

**¡Listo para integrar! 🚀**

Selecciona el snippet que corresponde a tu tecnología y adapta según tus necesidades.

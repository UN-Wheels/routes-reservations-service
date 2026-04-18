/**
 * ======================================
 * INTEGRACIÓN FRONTEND - VUE 3
 * Mostrar Ruta Optimizada
 * ======================================
 */

// npm install vue-3-google-map

<template>
  <div class="route-container">
    <!-- Encabezado -->
    <div class="header">
      <h1>🗺️ Ruta Optimizada</h1>
      <p v-if="route" class="status" :class="route.status.toLowerCase()">
        Estado: {{ route.status }}
      </p>
    </div>

    <!-- Cargando -->
    <div v-if="loading" class="loading">
      ⏳ Cargando ruta optimizada...
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error">
      ❌ Error: {{ error }}
    </div>

    <!-- Contenido Principal -->
    <div v-else-if="route" class="content">
      <!-- Información Resumida -->
      <div class="info-box">
        <h3>📊 Información de la Ruta</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Distancia Total:</span>
            <span class="value distance">{{ route.totalDistanceKm }} km</span>
          </div>
          <div class="info-item">
            <span class="label">Total de paradas:</span>
            <span class="value">{{ route.optimizedRoute.length - 2 }}</span>
          </div>
          <div class="info-item">
            <span class="label">Estado:</span>
            <span class="value">{{ route.status }}</span>
          </div>
          <div class="info-item">
            <span class="label">Iniciada:</span>
            <span class="value">{{ formatDate(route.startedAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Mapa -->
      <div class="map-section">
        <h3>📍 Mapa de la Ruta</h3>
        <GoogleMap
          api-key="YOUR_GOOGLE_MAPS_API_KEY"
          style="width: 100%; height: 400px"
          :center="mapCenter"
          :zoom="13"
        >
          <!-- Línea que conecta los puntos -->
          <Polyline
            :path="routePath"
            :options="{
              strokeColor: '#0066cc',
              strokeWeight: 3,
              geodesic: true
            }"
          />

          <!-- Marcadores -->
          <Marker
            v-for="(point, index) in route.optimizedRoute"
            :key="index"
            :position="{ lat: point.lat, lng: point.lng }"
            :title="point.name"
            :label="{
              text: (index + 1).toString(),
              color: 'white',
              fontWeight: 'bold'
            }"
            :icon="{
              fillColor: getMarkerColor(point.type),
              fillOpacity: 1,
              path: 'M0,0 C -2,-2 -2,2 0,4 C 2,2 2,-2 0,0 z',
              scale: 8,
              strokeColor: 'white',
              strokeWeight: 2
            }"
          />
        </GoogleMap>
      </div>

      <!-- Lista de Paradas -->
      <div class="stops-section">
        <h3>📋 Orden de Paradas</h3>
        <ol class="stops-list">
          <li
            v-for="(point, index) in route.optimizedRoute"
            :key="index"
            class="stop-item"
          >
            <div class="stop-number">{{ index + 1 }}</div>
            <div class="stop-details">
              <strong>{{ getEmoji(point.type) }} {{ point.name }}</strong>
              <small>
                📍 Lat: {{ point.lat.toFixed(4) }}, Lng: {{ point.lng.toFixed(4) }}
              </small>
            </div>
          </li>
        </ol>
      </div>

      <!-- Botón Recargar -->
      <button @click="loadRoute" class="btn-reload">
        🔄 Recargar Ruta
      </button>
    </div>

    <!-- Botón Iniciar Ruta (si aún no está iniciada) -->
    <div v-else class="start-section">
      <button
        @click="startRoute"
        :disabled="starting"
        class="btn-start"
      >
        {{ starting ? '⏳ Iniciando...' : '🚀 Iniciar Ruta' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { GoogleMap, Marker, Polyline } from 'vue-3-google-map';

const props = defineProps({
  routeId: {
    type: String,
    required: true
  }
});

const route = ref(null);
const loading = ref(false);
const starting = ref(false);
const error = ref(null);

// Composable para llamadas API
const useRouteAPI = () => {
  const baseURL = 'http://localhost:3000';

  const getToken = () => localStorage.getItem('authToken');

  const getOptimizedRoute = async (routeId) => {
    const response = await fetch(
      `${baseURL}/routes/${routeId}/optimized`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    );
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  };

  const startRoute = async (routeId) => {
    const response = await fetch(
      `${baseURL}/routes/${routeId}/start`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`
        }
      }
    );
    if (!response.ok) throw new Error(response.statusText);
    return response.json();
  };

  return { getOptimizedRoute, startRoute };
};

const api = useRouteAPI();

// Métodos
const loadRoute = async () => {
  try {
    loading.value = true;
    route.value = await api.getOptimizedRoute(props.routeId);
    error.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const startRouteHandler = async () => {
  try {
    starting.value = true;
    const data = await api.startRoute(props.routeId);
    route.value = data.route;
    error.value = null;
    alert('✅ Ruta iniciada exitosamente');
  } catch (err) {
    error.value = err.message;
    alert('❌ Error al iniciar la ruta');
  } finally {
    starting.value = false;
  }
};

// Utilidades
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('es-ES');
};

const getEmoji = (type) => {
  return type === 'origin' ? '🏠' : type === 'destination' ? '🎯' : '🚶';
};

const getMarkerColor = (type) => {
  return type === 'origin' ? 'green' : type === 'destination' ? 'red' : 'blue';
};

// Computed properties
const mapCenter = computed(() => {
  return route.value
    ? { lat: route.value.origin.lat, lng: route.value.origin.lng }
    : { lat: 0, lng: 0 };
});

const routePath = computed(() => {
  return route.value
    ? route.value.optimizedRoute.map(point => ({
        lat: point.lat,
        lng: point.lng
      }))
    : [];
});

// Lifecycle
onMounted(() => {
  loadRoute();
});
</script>

<style scoped>
.route-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h1 {
  margin: 0;
  color: #333;
  font-size: 28px;
}

.status {
  margin-top: 10px;
  padding: 10px 20px;
  display: inline-block;
  border-radius: 20px;
  font-size: 14px;
  font-weight: bold;
}

.status.in_progress {
  background-color: #fff3cd;
  color: #856404;
}

.status.completed {
  background-color: #d4edda;
  color: #155724;
}

.loading,
.error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 8px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.info-box {
  background-color: #f0f0f0;
  padding: 20px;
  border-radius: 8px;
}

.info-box h3 {
  margin-top: 0;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.info-item {
  background-color: white;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #0066cc;
}

.label {
  display: block;
  color: #666;
  font-size: 12px;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.value.distance {
  color: #0066cc;
  font-size: 24px;
}

.map-section {
  display: flex;
  flex-direction: column;
}

.map-section h3 {
  margin-top: 0;
  color: #333;
}

.stops-section {
  display: flex;
  flex-direction: column;
}

.stops-section h3 {
  margin-top: 0;
  color: #333;
}

.stops-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stop-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  background-color: white;
  padding: 15px;
  border-radius: 4px;
  border-left: 4px solid #0066cc;
}

.stop-number {
  min-width: 40px;
  width: 40px;
  height: 40px;
  background-color: #0066cc;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.stop-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stop-details strong {
  color: #333;
  font-size: 16px;
}

.stop-details small {
  color: #666;
  font-size: 12px;
}

.btn-reload,
.btn-start {
  padding: 15px 30px;
  font-size: 16px;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-reload {
  background-color: #0066cc;
  color: white;
  align-self: flex-start;
  margin-top: 20px;
}

.btn-reload:hover {
  background-color: #0052a3;
}

.btn-start {
  background-color: #4CAF50;
  color: white;
  align-self: center;
  padding: 20px 40px;
  font-size: 18px;
}

.btn-start:hover:not(:disabled) {
  background-color: #45a049;
}

.btn-start:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.start-section {
  text-align: center;
  padding: 40px;
}
</style>

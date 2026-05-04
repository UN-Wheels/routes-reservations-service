/**
 * 🗺️ UTILIDADES FRONTEND - Validación Geográfica
 * 
 * Cómo integrar las restricciones de Cundinamarca y Universidad
 */

// ============================================
// 1. OBTENER INFORMACIÓN GEOGRÁFICA DEL BACKEND
// ============================================

class GeographicService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  /**
   * Obtener entradas de la Universidad
   */
  async getUniversityEntrances() {
    try {
      const response = await fetch(`${this.apiUrl}/routes/geo/university-entrances`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching university entrances:', error);
      return null;
    }
  }

  /**
   * Obtener límites de Cundinamarca
   */
  async getCundinamarcaBounds() {
    try {
      const response = await fetch(`${this.apiUrl}/routes/geo/cundinamarca-bounds`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching Cundinamarca bounds:', error);
      return null;
    }
  }
}

// ============================================
// 2. VALIDACIÓN EN REACT (Ejemplo)
// ============================================

import React, { useState, useEffect } from 'react';

function CreateRouteForm() {
  const [universityEntrances, setUniversityEntrances] = useState([]);
  const [cundinamarcaBounds, setCundinamarcaBounds] = useState(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [error, setError] = useState(null);

  const geoService = new GeographicService('http://localhost:3000');

  useEffect(() => {
    // Cargar datos geográficos al montar el componente
    const loadGeoData = async () => {
      const entrances = await geoService.getUniversityEntrances();
      const bounds = await geoService.getCundinamarcaBounds();
      
      if (entrances?.entrances) {
        setUniversityEntrances(entrances.entrances);
      }
      if (bounds?.bounds) {
        setCundinamarcaBounds(bounds.bounds);
      }
    };

    loadGeoData();
  }, []);

  const isInsideCundinamarca = (lat, lng) => {
    if (!cundinamarcaBounds) return false;
    const { north, south, east, west } = cundinamarcaBounds;
    return lat >= south && lat <= north && lng >= west && lng <= east;
  };

  const isNearUniversityEntrance = (lat, lng) => {
    // Calcular distancia a cada entrada (tolerancia: 500m)
    return universityEntrances.some(entrance => {
      const distance = calculateDistance(
        { lat, lng },
        { lat: entrance.lat, lng: entrance.lng }
      );
      return distance <= 500; // 500 metros
    });
  };

  const calculateDistance = (point1, point2) => {
    const R = 6371000; // Radio en metros
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

  const handleLocationChange = (type, lat, lng) => {
    // Validar que esté dentro de Cundinamarca
    if (!isInsideCundinamarca(lat, lng)) {
      setError(`${type} debe estar dentro de Cundinamarca`);
      return;
    }

    // Si está en la zona de la Universidad, validar entrada
    const inUniversityZone = calculateDistance(
      { lat, lng },
      { lat: 4.7208, lng: -74.0555 }
    ) <= 2000; // Radio de 2km

    if (inUniversityZone && !isNearUniversityEntrance(lat, lng)) {
      setError(
        `${type} está en la Universidad pero no en una entrada válida. ` +
        `Entradas disponibles: ${universityEntrances.map(e => e.name).join(', ')}`
      );
      return;
    }

    setError(null);
    if (type === 'origen') setOrigin({ lat, lng });
    if (type === 'destino') setDestination({ lat, lng });
  };

  const handleSubmit = async () => {
    if (!origin || !destination) {
      setError('Especifica origen y destino');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          origin: { ...origin, name: 'Origen' },
          destination: { ...destination, name: 'Destino' },
          departureTime: new Date().toISOString(),
          pricePerSeat: 5000
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        setError(errData.error);
        return;
      }

      const route = await response.json();
      alert('Ruta creada exitosamente!');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Crear Ruta</h2>
      
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

      <div>
        <h3>Selecciona Origen</h3>
        <div>
          Latitud:{' '}
          <input
            type="number"
            step="0.0001"
            placeholder="4.7208"
            onChange={(e) => {
              if (e.target.value && origin?.lng)
                handleLocationChange('Origen', parseFloat(e.target.value), origin.lng);
            }}
          />
        </div>
        <div>
          Longitud:{' '}
          <input
            type="number"
            step="0.0001"
            placeholder="-74.0555"
            onChange={(e) => {
              if (e.target.value && origin?.lat)
                handleLocationChange('Origen', origin.lat, parseFloat(e.target.value));
            }}
          />
        </div>
      </div>

      <div>
        <h3>Selecciona Destino</h3>
        <div>
          Latitud:{' '}
          <input
            type="number"
            step="0.0001"
            placeholder="4.6500"
            onChange={(e) => {
              if (e.target.value && destination?.lng)
                handleLocationChange('Destino', parseFloat(e.target.value), destination.lng);
            }}
          />
        </div>
        <div>
          Longitud:{' '}
          <input
            type="number"
            step="0.0001"
            placeholder="-74.0700"
            onChange={(e) => {
              if (e.target.value && destination?.lat)
                handleLocationChange('Destino', destination.lat, parseFloat(e.target.value));
            }}
          />
        </div>
      </div>

      <h3>Entradas de la Universidad</h3>
      <ul>
        {universityEntrances.map((entrance) => (
          <li key={entrance.id}>
            {entrance.name} ({entrance.lat}, {entrance.lng})
          </li>
        ))}
      </ul>

      <h3>Límites de Cundinamarca</h3>
      {cundinamarcaBounds && (
        <div>
          <p>Norte: {cundinamarcaBounds.north}°</p>
          <p>Sur: {cundinamarcaBounds.south}°</p>
          <p>Este: {cundinamarcaBounds.east}°</p>
          <p>Oeste: {cundinamarcaBounds.west}°</p>
        </div>
      )}

      <button onClick={handleSubmit} style={{ marginTop: '20px', padding: '10px' }}>
        Crear Ruta
      </button>
    </div>
  );
}

export default CreateRouteForm;

// ============================================
// 3. VALIDACIÓN EN VUE 3 (Ejemplo)
// ============================================

const VueExample = `
<template>
  <div>
    <h2>Crear Ruta con Validación Geográfica</h2>

    <div v-if="error" class="error">{{ error }}</div>

    <div>
      <h3>Origen</h3>
      <input 
        v-model.number="origin.lat" 
        type="number" 
        step="0.0001"
        placeholder="Latitud"
        @change="validateLocation('origin')"
      />
      <input 
        v-model.number="origin.lng" 
        type="number" 
        step="0.0001"
        placeholder="Longitud"
        @change="validateLocation('origin')"
      />
    </div>

    <div>
      <h3>Destino</h3>
      <input 
        v-model.number="destination.lat" 
        type="number" 
        step="0.0001"
        placeholder="Latitud"
        @change="validateLocation('destination')"
      />
      <input 
        v-model.number="destination.lng" 
        type="number" 
        step="0.0001"
        placeholder="Longitud"
        @change="validateLocation('destination')"
      />
    </div>

    <div>
      <h3>Entradas de la Universidad</h3>
      <ul>
        <li v-for="entrance in universityEntrances" :key="entrance.id">
          {{ entrance.name }} ({{ entrance.lat }}, {{ entrance.lng }})
        </li>
      </ul>
    </div>

    <button @click="submitRoute">Crear Ruta</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const origin = ref({ lat: null, lng: null });
const destination = ref({ lat: null, lng: null });
const universityEntrances = ref([]);
const cundinamarcaBounds = ref(null);
const error = ref(null);

onMounted(async () => {
  const entrances = await fetch(
    'http://localhost:3000/routes/geo/university-entrances'
  ).then(r => r.json());
  universityEntrances.value = entrances.entrances || [];

  const bounds = await fetch(
    'http://localhost:3000/routes/geo/cundinamarca-bounds'
  ).then(r => r.json());
  cundinamarcaBounds.value = bounds.bounds;
});

const validateLocation = (type) => {
  const location = type === 'origin' ? origin.value : destination.value;
  
  if (!location.lat || !location.lng) {
    error.value = 'Especifica coordenadas válidas';
    return;
  }

  if (
    location.lat < cundinamarcaBounds.value.south ||
    location.lat > cundinamarcaBounds.value.north ||
    location.lng < cundinamarcaBounds.value.west ||
    location.lng > cundinamarcaBounds.value.east
  ) {
    error.value = tipo + ' está fuera de Cundinamarca';
  } else {
    error.value = null;
  }
};

const submitRoute = async () => {
  try {
    const response = await fetch('http://localhost:3000/routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      },
      body: JSON.stringify({
        origin: { ...origin.value, name: 'Origen' },
        destination: { ...destination.value, name: 'Destino' },
        departureTime: new Date().toISOString(),
        pricePerSeat: 5000
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      error.value = errData.error;
      return;
    }

    alert('¡Ruta creada!');
  } catch (err) {
    error.value = err.message;
  }
};
</script>
`;

// ============================================
// 4. PLUGIN PARA MAPAS (Google Maps + Validación)
// ============================================

class MapWithGeographicValidation {
  constructor(mapElement, apiKey) {
    this.map = new google.maps.Map(mapElement, {
      zoom: 12,
      center: { lat: 4.65, lng: -74.25 } // Centro de Cundinamarca
    });
    this.geoService = new GeographicService('http://localhost:3000');
    this.selectedMarkers = [];
    this.initializeMap();
  }

  async initializeMap() {
    const bounds = await this.geoService.getCundinamarcaBounds();
    if (bounds?.bounds) {
      // Dibujar límites de Cundinamarca
      const boundingBox = new google.maps.Rectangle({
        bounds: {
          north: bounds.bounds.north,
          south: bounds.bounds.south,
          east: bounds.bounds.east,
          west: bounds.bounds.west
        },
        editable: false,
        fillColor: '#4285F4',
        fillOpacity: 0.1,
        strokeColor: '#4285F4',
        strokeOpacity: 1,
        strokeWeight: 2,
        map: this.map
      });
    }

    // Agregar entradas de la Universidad
    const entrances = await this.geoService.getUniversityEntrances();
    if (entrances?.entrances) {
      entrances.entrances.forEach((entrance) => {
        new google.maps.Marker({
          position: { lat: entrance.lat, lng: entrance.lng },
          map: this.map,
          title: entrance.name,
          icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
        });
      });
    }
  }

  addLocationMarker(type, lat, lng) {
    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
      title: type,
      icon:
        type === 'Origen'
          ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
          : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
    });

    this.selectedMarkers.push(marker);

    if (this.selectedMarkers.length > 1) {
      // Dibujar línea entre puntos
      new google.maps.Polyline({
        path: [
          { lat: this.selectedMarkers[0].getPosition().lat(), lng: this.selectedMarkers[0].getPosition().lng() },
          { lat, lng }
        ],
        map: this.map,
        strokeColor: '#0066cc',
        strokeWeight: 3
      });
    }
  }

  clearMarkers() {
    this.selectedMarkers.forEach((marker) => marker.setMap(null));
    this.selectedMarkers = [];
  }
}

export {
  GeographicService,
  MapWithGeographicValidation
};

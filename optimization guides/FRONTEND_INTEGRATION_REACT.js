/**
 * ======================================
 * GUÍA DE INTEGRACIÓN FRONTEND
 * Mostrar Ruta Optimizada
 * ======================================
 */

// ============================================
// 1. SERVICIO API - OBTENER RUTA OPTIMIZADA
// ============================================

class RouteAPIService {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  // Obtener token del localStorage
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Iniciar ruta y obtener secuencia optimizada
  async startRoute(routeId) {
    try {
      const response = await fetch(
        `${this.baseURL}/routes/${routeId}/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.getToken()}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error al iniciar ruta:', error);
      throw error;
    }
  }

  // Obtener detalles de la ruta optimizada
  async getOptimizedRoute(routeId) {
    try {
      const response = await fetch(
        `${this.baseURL}/routes/${routeId}/optimized`,
        {
          headers: {
            Authorization: `Bearer ${this.getToken()}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Error al obtener ruta optimizada:', error);
      throw error;
    }
  }
}

// ============================================
// 2. COMPONENTE REACT - MOSTRAR RUTA
// ============================================

// Instalación necesaria:
// npm install react-google-maps @react-google-maps/api

import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';

const OptimizedRouteDisplay = ({ routeId, driverId }) => {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiService = new RouteAPIService();

  useEffect(() => {
    loadRoute();
  }, [routeId]);

  const loadRoute = async () => {
    try {
      setLoading(true);
      const data = await apiService.getOptimizedRoute(routeId);
      setRoute(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>⏳ Cargando ruta optimizada...</div>;
  if (error) return <div>❌ Error: {error}</div>;
  if (!route) return <div>No hay ruta disponible</div>;

  const mapCenter = {
    lat: route.origin.lat,
    lng: route.origin.lng
  };

  // Coordenadas para la polilínea (línea que conecta los puntos)
  const routePath = route.optimizedRoute.map(point => ({
    lat: point.lat,
    lng: point.lng
  }));

  return (
    <div style={{ padding: '20px' }}>
      <h1>🗺️ Ruta Optimizada</h1>

      {/* Información Resumida */}
      <div
        style={{
          backgroundColor: '#f0f0f0',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}
      >
        <h3>📊 Información de la Ruta</h3>
        <p>
          <strong>Distancia Total:</strong>{' '}
          <span style={{ color: '#0066cc', fontSize: '18px' }}>
            {route.totalDistanceKm} km
          </span>
        </p>
        <p>
          <strong>Total de paradas:</strong> {route.optimizedRoute.length - 2}
        </p>
        <p>
          <strong>Estado:</strong> {route.status}
        </p>
      </div>

      {/* Mapa */}
      <div style={{ marginBottom: '20px' }}>
        <h3>📍 Mapa de la Ruta</h3>
        <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
          <GoogleMap
            mapContainerStyle={{
              width: '100%',
              height: '400px',
              borderRadius: '8px'
            }}
            center={mapCenter}
            zoom={13}
          >
            {/* Línea que conecta los puntos */}
            <Polyline
              path={routePath}
              options={{
                strokeColor: '#0066cc',
                strokeWeight: 3,
                geodesic: true
              }}
            />

            {/* Marcadores para cada parada */}
            {route.optimizedRoute.map((point, index) => {
              const colors = {
                origin: 'green',
                destination: 'red',
                default: 'blue'
              };

              const color = point.type === 'origin'
                ? colors.origin
                : point.type === 'destination'
                ? colors.destination
                : colors.default;

              return (
                <Marker
                  key={index}
                  position={{ lat: point.lat, lng: point.lng }}
                  title={point.name}
                  label={{
                    text: (index + 1).toString(),
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                  icon={{
                    fillColor: color,
                    fillOpacity: 1,
                    path: 'M0,0 C -2,-2 -2,2 0,4 C 2,2 2,-2 0,0 z',
                    scale: 8,
                    strokeColor: 'white',
                    strokeWeight: 2
                  }}
                />
              );
            })}
          </GoogleMap>
        </LoadScript>
      </div>

      {/* Lista de Paradas en Orden */}
      <div>
        <h3>📋 Orden de Paradas</h3>
        <ol style={{ backgroundColor: '#f9f9f9', padding: '20px' }}>
          {route.optimizedRoute.map((point, index) => {
            const emoji = point.type === 'origin'
              ? '🏠'
              : point.type === 'destination'
              ? '🎯'
              : '🚶';

            return (
              <li
                key={index}
                style={{
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: 'white',
                  borderLeft: '4px solid #0066cc',
                  borderRadius: '4px'
                }}
              >
                <strong>{emoji} {point.name}</strong>
                <br />
                <small>📍 Lat: {point.lat.toFixed(4)}, Lng: {point.lng.toFixed(4)}</small>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Botón para Recargar */}
      <button
        onClick={loadRoute}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        🔄 Recargar Ruta
      </button>
    </div>
  );
};

export default OptimizedRouteDisplay;

// ============================================
// 3. COMPONENTE CONDUCTOR - INICIAR RUTA
// ============================================

const DriverStartRoute = ({ routeId }) => {
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiService = new RouteAPIService();

  const handleStartRoute = async () => {
    try {
      setLoading(true);
      const data = await apiService.startRoute(routeId);
      setRoute(data.route);
      setError(null);
      alert('✅ Ruta iniciada exitosamente');
    } catch (err) {
      setError(err.message);
      alert('❌ Error al iniciar la ruta');
    } finally {
      setLoading(false);
    }
  };

  if (route) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
        <h2>✅ Ruta Iniciada</h2>
        <p><strong>Estado:</strong> {route.status}</p>
        <p><strong>Iniciada:</strong> {new Date(route.startedAt).toLocaleString()}</p>

        {/* Ver ruta en mapa */}
        <OptimizedRouteDisplay routeId={routeId} />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleStartRoute}
        disabled={loading}
        style={{
          padding: '15px 30px',
          backgroundColor: loading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '18px',
          fontWeight: 'bold'
        }}
      >
        {loading ? '⏳ Iniciando...' : '🚀 Iniciar Ruta'}
      </button>

      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          ❌ {error}
        </div>
      )}
    </div>
  );
};

export { OptimizedRouteDisplay, DriverStartRoute, RouteAPIService };

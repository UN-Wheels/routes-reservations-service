#!/bin/bash

# ============================================
# EJEMPLOS DE PRUEBA - ENDPOINTS NUEVOS
# ============================================

# Base URL (cambiar según tu entorno)
BASE_URL="http://localhost:3000"
DRIVER_TOKEN="tu-token-conductor-aqui"
PASSENGER_TOKEN="tu-token-pasajero-aqui"

# ============================================
# 1. CREAR UNA NUEVA RUTA
# ============================================

echo "1️⃣  Creando una nueva ruta..."

ROUTE_RESPONSE=$(curl -X POST "$BASE_URL/routes" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -d '{
    "origin": {
      "name": "Casa del conductor",
      "lat": 4.7110,
      "lng": -74.0721
    },
    "destination": {
      "name": "Oficina Principal",
      "lat": 4.7169,
      "lng": -74.0894
    },
    "departureTime": "'$(date -u -d '+1 hour' '+%Y-%m-%dT%H:%M:%SZ')'",
    "totalSeats": 4
  }')

echo "Respuesta:"
echo "$ROUTE_RESPONSE" | jq '.'

# Extraer ROUTE_ID (requiere jq)
ROUTE_ID=$(echo "$ROUTE_RESPONSE" | jq -r '._id')
echo "📍 ROUTE_ID: $ROUTE_ID"
echo ""

# ============================================
# 2. PASAJEROS HACEN RESERVAS
# ============================================

echo "2️⃣  Pasajero 1 hace reserva..."

curl -X POST "$BASE_URL/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PASSENGER_TOKEN" \
  -d '{
    "routeId": "'$ROUTE_ID'",
    "pickupLocation": {
      "name": "Centro Comercial Monterrey",
      "lat": 4.7125,
      "lng": -74.0735
    }
  }' | jq '.'

echo "3️⃣  Pasajero 2 hace reserva..."

curl -X POST "$BASE_URL/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PASSENGER_TOKEN" \
  -d '{
    "routeId": "'$ROUTE_ID'",
    "pickupLocation": {
      "name": "Estación de Metro",
      "lat": 4.7115,
      "lng": -74.0725
    }
  }' | jq '.'

echo "4️⃣  Pasajero 3 hace reserva..."

curl -X POST "$BASE_URL/reservations" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PASSENGER_TOKEN" \
  -d '{
    "routeId": "'$ROUTE_ID'",
    "pickupLocation": {
      "name": "Parque Principal",
      "lat": 4.7135,
      "lng": -74.0745
    }
  }' | jq '.'

echo ""
sleep 2

# ============================================
# 3. CONDUCTOR INICIA LA RUTA ⭐
# ============================================

echo "🚀 CONDUCTOR INICIA LA RUTA - CALCULA SECUENCIA ÓPTIMA"
echo "======================================================"
echo ""

START_RESPONSE=$(curl -X POST "$BASE_URL/routes/$ROUTE_ID/start" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DRIVER_TOKEN")

echo "Respuesta:"
echo "$START_RESPONSE" | jq '.'

echo ""
echo "📋 RUTA OPTIMIZADA (Orden de visitas):"
echo "$START_RESPONSE" | jq '.route.optimizedRoute[] | "\(.order). \(.name) (\(.type)) - Lat: \(.lat), Lng: \(.lng)"'

echo ""
sleep 2

# ============================================
# 4. OBTENER DETALLES DE LA RUTA OPTIMIZADA ⭐
# ============================================

echo "📊 OBTENER DETALLES DE LA RUTA OPTIMIZADA"
echo "========================================="
echo ""

DETAILS_RESPONSE=$(curl -X GET "$BASE_URL/routes/$ROUTE_ID/optimized" \
  -H "Authorization: Bearer $DRIVER_TOKEN")

echo "Respuesta:"
echo "$DETAILS_RESPONSE" | jq '.'

echo ""
echo "📐 RESUMEN:"
echo "Total de paradas: $(echo "$DETAILS_RESPONSE" | jq '.optimizedRoute | length - 2') (excluyendo origen y destino)"
echo "Distancia total: $(echo "$DETAILS_RESPONSE" | jq '.totalDistanceKm') km"
echo "Distancia total: $(echo "$DETAILS_RESPONSE" | jq '.totalDistance') metros"
echo "Estado: $(echo "$DETAILS_RESPONSE" | jq '.status')"

echo ""
echo "✅ PRUEBAS COMPLETADAS"

# ============================================
# PRUEBAS ADICIONALES (Descomentar para usar)
# ============================================

# Ver todas las rutas disponibles
# echo ""
# echo "Ver rutas disponibles:"
# curl -X GET "$BASE_URL/routes/available" \
#   -H "Authorization: Bearer $DRIVER_TOKEN" | jq '.'

# Ver detalles de una ruta específica
# echo ""
# echo "Ver detalles de la ruta:"
# curl -X GET "$BASE_URL/routes/$ROUTE_ID" \
#   -H "Authorization: Bearer $DRIVER_TOKEN" | jq '.'

# Cancelar una ruta
# echo ""
# echo "Cancelar la ruta:"
# curl -X DELETE "$BASE_URL/routes/$ROUTE_ID" \
#   -H "Authorization: Bearer $DRIVER_TOKEN" | jq '.'

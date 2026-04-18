# ============================================
# EJEMPLOS DE PRUEBA - ENDPOINTS NUEVOS
# PowerShell Version (Windows)
# ============================================

$BASE_URL = "http://localhost:3000"
$DRIVER_TOKEN = "tu-token-conductor-aqui"
$PASSENGER_TOKEN = "tu-token-pasajero-aqui"

# Headers comunes
$headers = @{
    "Content-Type" = "application/json"
}

# ============================================
# 1. CREAR UNA NUEVA RUTA
# ============================================

Write-Host "1️⃣  Creando una nueva ruta..." -ForegroundColor Green

$routeData = @{
    origin = @{
        name = "Casa del conductor"
        lat  = 4.7110
        lng  = -74.0721
    }
    destination = @{
        name = "Oficina Principal"
        lat  = 4.7169
        lng  = -74.0894
    }
    departureTime = (Get-Date).AddHours(1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    totalSeats    = 4
} | ConvertTo-Json

$headers["Authorization"] = "Bearer $DRIVER_TOKEN"

$routeResponse = Invoke-WebRequest -Uri "$BASE_URL/routes" `
    -Method POST `
    -Headers $headers `
    -Body $routeData

$route = $routeResponse.Content | ConvertFrom-Json
$ROUTE_ID = $route._id

Write-Host "✅ Ruta creada exitosamente"
Write-Host "📍 ROUTE_ID: $ROUTE_ID" -ForegroundColor Cyan
Write-Host "Respuesta completa:"
$routeResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host
Write-Host ""

Start-Sleep -Seconds 1

# ============================================
# 2. PASAJEROS HACEN RESERVAS
# ============================================

Write-Host "2️⃣  Pasajero 1 hace reserva..." -ForegroundColor Green

$reservation1 = @{
    routeId        = $ROUTE_ID
    pickupLocation = @{
        name = "Centro Comercial Monterrey"
        lat  = 4.7125
        lng  = -74.0735
    }
} | ConvertTo-Json

$headers["Authorization"] = "Bearer $PASSENGER_TOKEN"

$res1Response = Invoke-WebRequest -Uri "$BASE_URL/reservations" `
    -Method POST `
    -Headers $headers `
    -Body $reservation1

Write-Host "✅ Reserva 1 confirmada" -ForegroundColor Green
Write-Host ""

Write-Host "3️⃣  Pasajero 2 hace reserva..." -ForegroundColor Green

$reservation2 = @{
    routeId        = $ROUTE_ID
    pickupLocation = @{
        name = "Estación de Metro"
        lat  = 4.7115
        lng  = -74.0725
    }
} | ConvertTo-Json

$res2Response = Invoke-WebRequest -Uri "$BASE_URL/reservations" `
    -Method POST `
    -Headers $headers `
    -Body $reservation2

Write-Host "✅ Reserva 2 confirmada" -ForegroundColor Green
Write-Host ""

Write-Host "4️⃣  Pasajero 3 hace reserva..." -ForegroundColor Green

$reservation3 = @{
    routeId        = $ROUTE_ID
    pickupLocation = @{
        name = "Parque Principal"
        lat  = 4.7135
        lng  = -74.0745
    }
} | ConvertTo-Json

$res3Response = Invoke-WebRequest -Uri "$BASE_URL/reservations" `
    -Method POST `
    -Headers $headers `
    -Body $reservation3

Write-Host "✅ Reserva 3 confirmada" -ForegroundColor Green
Write-Host ""

Start-Sleep -Seconds 2

# ============================================
# 3. CONDUCTOR INICIA LA RUTA ⭐ (ENDPOINT NUEVO)
# ============================================

Write-Host "🚀 CONDUCTOR INICIA LA RUTA - CALCULA SECUENCIA ÓPTIMA" -ForegroundColor Yellow
Write-Host "=====================================================" -ForegroundColor Yellow
Write-Host ""

$headers["Authorization"] = "Bearer $DRIVER_TOKEN"

$startResponse = Invoke-WebRequest -Uri "$BASE_URL/routes/$ROUTE_ID/start" `
    -Method POST `
    -Headers $headers `
    -Body '{}'

$startData = $startResponse.Content | ConvertFrom-Json

Write-Host "✅ Ruta iniciada exitosamente" -ForegroundColor Green
Write-Host ""
Write-Host "📋 RUTA OPTIMIZADA (Orden de visitas):" -ForegroundColor Cyan
Write-Host ""

$startData.route.optimizedRoute | ForEach-Object {
    Write-Host "  $($_.order). $($_.name)" -ForegroundColor Magenta
    Write-Host "     📍 Coordenadas: Lat=$($_.lat), Lng=$($_.lng)" -ForegroundColor Gray
    Write-Host "     Tipo: $($_.type)" -ForegroundColor Gray
    Write-Host ""
}

Write-Host ""

# ============================================
# 4. OBTENER DETALLES DE LA RUTA OPTIMIZADA ⭐ (ENDPOINT NUEVO)
# ============================================

Write-Host "📊 OBTENER DETALLES DE LA RUTA OPTIMIZADA" -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow
Write-Host ""

$detailsResponse = Invoke-WebRequest -Uri "$BASE_URL/routes/$ROUTE_ID/optimized" `
    -Method GET `
    -Headers $headers

$details = $detailsResponse.Content | ConvertFrom-Json

Write-Host "✅ Detalles obtenidos" -ForegroundColor Green
Write-Host ""
Write-Host "📐 RESUMEN DE LA RUTA:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

$stopCount = $details.optimizedRoute.Count - 2
Write-Host "  Total de paradas: $stopCount (excluyendo origen y destino)" -ForegroundColor White
Write-Host "  Distancia total: $($details.totalDistanceKm) km" -ForegroundColor White
Write-Host "  Distancia total: $($details.totalDistance) metros" -ForegroundColor White
Write-Host "  Estado de la ruta: $($details.status)" -ForegroundColor White
Write-Host "  Iniciada: $($details.startedAt)" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

Write-Host ""

# ============================================
# SALIDA DETALLADA DE RESPUESTAS (OPCIONAL)
# ============================================

Write-Host ""
Write-Host "📄 RESPUESTA COMPLETA DE START ROUTE:" -ForegroundColor Cyan
Write-Host $startResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10 -WarningAction SilentlyContinue

Write-Host ""
Write-Host "📄 RESPUESTA COMPLETA DE OPTIMIZED DETAILS:" -ForegroundColor Cyan
Write-Host $detailsResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10 -WarningAction SilentlyContinue

Write-Host ""
Write-Host "✅ PRUEBAS COMPLETADAS" -ForegroundColor Green

# ============================================
# FUNCIONES AUXILIARES (Descomentar para usar)
# ============================================

<#
# Ver todas las rutas disponibles
Write-Host ""
Write-Host "Ver rutas disponibles:"
$availableResponse = Invoke-WebRequest -Uri "$BASE_URL/routes/available" `
    -Method GET `
    -Headers @{ "Authorization" = "Bearer $DRIVER_TOKEN" }
$availableResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Ver detalles de una ruta específica
Write-Host ""
Write-Host "Ver detalles de la ruta:"
$detailResponse = Invoke-WebRequest -Uri "$BASE_URL/routes/$ROUTE_ID" `
    -Method GET `
    -Headers @{ "Authorization" = "Bearer $DRIVER_TOKEN" }
$detailResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10

# Cancelar una ruta
Write-Host ""
Write-Host "Cancelar la ruta:"
$cancelResponse = Invoke-WebRequest -Uri "$BASE_URL/routes/$ROUTE_ID" `
    -Method DELETE `
    -Headers @{ "Authorization" = "Bearer $DRIVER_TOKEN" }
$cancelResponse.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
#>

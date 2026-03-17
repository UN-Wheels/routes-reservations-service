# Routes & Reservations Service

## Descripción General

El **Routes & Reservations Service** es un microservicio encargado de
gestionar la creación de rutas de transporte y la reserva de asientos
dentro del sistema **UniWheels**, una plataforma diseñada para facilitar
el transporte compartido entre estudiantes universitarios.

Este servicio permite a los conductores publicar rutas hacia el campus
universitario y a los pasajeros buscar rutas disponibles y reservar un
asiento en ellas. Además, se encarga de actualizar automáticamente la
disponibilidad de asientos y manejar cancelaciones de reservas.

El microservicio forma parte de una arquitectura basada en
**microservicios**, donde cada servicio se especializa en una
responsabilidad específica del sistema, permitiendo una mayor
escalabilidad, mantenibilidad y desacoplamiento entre componentes.

### Funcionalidades principales

-   Creación de rutas por parte de conductores
-   Consulta de rutas disponibles
-   Creación de reservas de asientos
-   Cancelación de reservas
-   Actualización automática de la disponibilidad de asientos

------------------------------------------------------------------------

# Arquitectura del Microservicio

Este servicio sigue una **arquitectura en capas (Layered Architecture)**
dentro de un entorno de **microservicios**.

Capas:

-   **Controller Layer** → Maneja solicitudes HTTP.
-   **Service Layer** → Contiene la lógica de negocio.
-   **Model Layer** → Define los esquemas de datos.
-   **Route Layer** → Define los endpoints HTTP.

------------------------------------------------------------------------

# Tecnologías

### Backend

-   Node.js
-   Express.js

### Base de datos

-   MongoDB
-   Mongoose

### Seguridad

-   JSON Web Token (JWT)

### Infraestructura

-   Docker
-   Docker Compose

### Librerías adicionales

-   dotenv
-   cors

------------------------------------------------------------------------

# Flujo de Funcionamiento

## 1. Creación de ruta

Un conductor autenticado crea una ruta indicando:

-   Origen
-   Destino
-   Hora de salida
-   Número total de asientos

El sistema guarda la ruta y establece los asientos disponibles.

## 2. Consulta de rutas

Los pasajeros consultan rutas activas usando el endpoint:

    GET /routes

## 3. Reserva de asiento

El sistema:

1.  Verifica que la ruta exista
2.  Verifica disponibilidad
3.  Crea la reserva
4.  Reduce los asientos disponibles

## 4. Cancelación de reserva

1.  Se cambia el estado a CANCELLED
2.  Se incrementan los asientos disponibles

------------------------------------------------------------------------

# Modelo de Datos

## Route

``` json
{
  "driverId": "string",
  "origin": {
    "name": "string",
    "lat": "number",
    "lng": "number"
  },
  "destination": {
    "name": "string",
    "lat": "number",
    "lng": "number"
  },
  "departureTime": "date",
  "totalSeats": "number",
  "availableSeats": "number",
  "status": "ACTIVE"
}
```

## Reservation

``` json
{
  "routeId": "ObjectId",
  "passengerId": "string",
  "status": "PENDING",
  "createdAt": "date"
}
```

------------------------------------------------------------------------

# Estructura del Proyecto

    routes-reservations-service/
    │
    ├── src/
    │
    ├── config/
    │   └── db.js
    │
    ├── controllers/
    │   ├── routeController.js
    │   └── reservationController.js
    │
    ├── middleware/
    │   └── auth.js
    │
    ├── models/
    │   ├── Route.js
    │   └── Reservation.js
    │
    ├── routes/
    │   ├── routeRoutes.js
    │   └── reservationRoutes.js
    │
    ├── services/
    │   ├── routeService.js
    │   └── reservationService.js
    │
    └── server.js
    │
    ├── Dockerfile
    ├── package.json
    └── README.md

------------------------------------------------------------------------

# Variables de Entorno

    PORT=4000
    MONGO_URI=mongodb://mongo:27017/routesdb
    JWT_SECRET=supersecretkey

------------------------------------------------------------------------

# Endpoints

## Crear ruta

    POST /routes

Body:

``` json
{
  "origin": { "name": "Chapinero", "lat": 4.6486, "lng": -74.0651 },
  "destination": { "name": "Universidad Nacional", "lat": 4.6351, "lng": -74.0703 },
  "departureTime": "2026-03-20T07:30:00",
  "totalSeats": 4
}
```

## Obtener rutas

    GET /routes

## Crear reserva

    POST /reservations

Body:

``` json
{
  "routeId": "ROUTE_ID"
}
```

## Cancelar reserva

    DELETE /reservations/:id

------------------------------------------------------------------------

# Docker

Construir imagen:

    docker build -t routes-reservations-service .

Ejecutar contenedor:

    docker run -p 4000:4000 routes-reservations-service

## Docker Compose

``` yaml
version: "3"

services:

  routes-service:
    build: .
    ports:
      - "4000:4000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/routesdb
      - JWT_SECRET=supersecretkey
    depends_on:
      - mongo

  mongo:
    image: mongo
    ports:
      - "27017:27017"
```

------------------------------------------------------------------------

# Probar los Endpoints

### Crear ruta

    curl -X POST http://localhost:4000/routes -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{
      "origin": { "name": "Chapinero", "lat": 4.6486, "lng": -74.0651 },
      "destination": { "name": "Universidad Nacional", "lat": 4.6351, "lng": -74.0703 },
      "departureTime": "2026-03-20T07:30:00",
      "totalSeats": 4
    }'

### Obtener rutas

    curl http://localhost:4000/routes

### Crear reserva

    curl -X POST http://localhost:4000/reservations -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" -d '{
      "routeId": "ROUTE_ID"
    }'

### Cancelar reserva

    curl -X DELETE http://localhost:4000/reservations/RESERVATION_ID -H "Authorization: Bearer TOKEN"

------------------------------------------------------------------------

# Autor

Microservicio desarrollado para el sistema **UniWheels**, una plataforma
de transporte compartido para estudiantes universitarios basada en
arquitectura de microservicios.

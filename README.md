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

# 🧱 Arquitectura del Microservicio

## 🔷 Diagrama General

``` mermaid
flowchart LR
    A[Frontend React] -->|HTTP REST + JWT| B[Routes & Reservations Service]
    B --> C[Controller Layer]
    C --> D[Service Layer]
    D --> E[Model Layer]
    E --> F[(MongoDB)]
```

------------------------------------------------------------------------

## 🔄 Flujo de Reservas

``` mermaid
sequenceDiagram
    participant P as Pasajero
    participant S as Microservicio
    participant D as Conductor

    P->>S: Solicitar reserva (PENDING)
    D->>S: Aceptar/Rechazar

    alt Aceptada
        S->>S: Reducir cupos
    else Rechazada
        S->>S: Mantener cupos
    end

    P->>S: Cancelar reserva
```

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
  "status": "ACTIVE | CANCELLED"
}
```

## Reservation

``` json
{
  "routeId": "ObjectId",
  "passengerId": "string",
  "status": "PENDING | ACCEPTED | REJECTED | CANCELLED",
}
```

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


# Endpoints

## 🚗 Rutas

### Publicar ruta

POST /routes → Publicar ruta

### Cancelar rutas

DELETE /routes/:id → Cancelar ruta

### Obtener rutas disponibles

GET /routes/available → Obtener rutas disponibles

## 🎫 Reservas

### Solicitar reserva

POST /reservations/request → Solicitar reserva

### Aceptar solicitud

PATCH /reservations/:id/accept → Aceptar solicitud

### Rechazar solicitud

PATCH /reservations/:id/reject → Rechazar solicitud

### Cancelar reserva

DELETE /reservations/:id → Cancelar reserva  

------------------------------------------------------------------------

# Variables de Entorno

    PORT=4000
    MONGO_URI=mongodb://mongo:27017/routesdb
    JWT_SECRET=supersecretkey

------------------------------------------------------------------------

# Docker

    docker build -t routes-reservations-service .
    docker run -p 4000:4000 routes-reservations-service

------------------------------------------------------------------------

# Autor

UniWheels Microservice

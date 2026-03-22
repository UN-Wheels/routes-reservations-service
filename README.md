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

POST /routes 

Permite a un conductor autenticado crear una nueva ruta de transporte.

🔐 Autenticación

Requerida (JWT en header)

Authorization: Bearer <TOKEN>
📥 Body
{
  "origin": {
    "name": "Chapinero",
    "lat": 4.6486,
    "lng": -74.0651
  },
  "destination": {
    "name": "Universidad Nacional",
    "lat": 4.6351,
    "lng": -74.0703
  },
  "departureTime": "2026-03-20T07:30:00",
  "totalSeats": 4
}
⚙️ Lógica interna
Extrae el driverId desde el token
Crea una nueva ruta con:
availableSeats = totalSeats
status = ACTIVE
Guarda en MongoDB
📤 Respuesta
{
  "_id": "routeId",
  "driverId": "driver123",
  "origin": {...},
  "destination": {...},
  "departureTime": "2026-03-20T07:30:00",
  "totalSeats": 4,
  "availableSeats": 4,
  "status": "ACTIVE"
}

### Cancelar rutas

DELETE /routes/:id 

Permite a un conductor cancelar una ruta previamente creada.

🔐 Autenticación

Requerida (JWT)

Authorization: Bearer <TOKEN>
📌 Parámetro
id: ID de la ruta a cancelar
⚙️ Lógica interna
Verifica que la ruta exista
Verifica que el usuario autenticado sea el conductor dueño de la ruta
Cambia el estado de la ruta a CANCELLED
Opcionalmente:
Notifica a los pasajeros con reservas activas
Cancela automáticamente las reservas asociadas
📤 Respuesta
{
  "_id": "routeId",
  "status": "CANCELLED"
}
⚠️ Validaciones
Solo el conductor creador puede cancelar la ruta
No se puede cancelar una ruta ya finalizada o cancelada

### Obtener rutas disponibles

GET /routes/available 

Permite consultar todas las rutas activas disponibles en el sistema.

🔐 Autenticación

No requerida

⚙️ Lógica interna
Filtra rutas con status = ACTIVE
Retorna lista completa
📤 Respuesta
[
  {
    "_id": "routeId",
    "origin": {...},
    "destination": {...},
    "availableSeats": 3
  }
]

## 🎫 Reservas

### Solicitar reserva

POST /reservations/request → Solicitar reserva

Permite a un pasajero reservar un asiento en una ruta.

🔐 Autenticación

Requerida

Authorization: Bearer <TOKEN>
📥 Body
{
  "routeId": "65f0c2bfa29a0b6c0d0a1234"
}
⚙️ Lógica interna
Verifica que la ruta exista
Verifica disponibilidad de asientos
Crea la reserva
Reduce availableSeats en la ruta
⚠️ Validaciones
Si no existe la ruta → error
Si no hay cupos → error
📤 Respuesta
{
  "_id": "reservationId",
  "routeId": "65f0c2bfa29a0b6c0d0a1234",
  "passengerId": "passenger123",
  "status": "PENDING",
  "createdAt": "2026-03-20T07:00:00"
}

### Aceptar solicitud

PATCH /reservations/:id/accept → Aceptar solicitud

Permite al conductor aceptar una solicitud de reserva realizada por un pasajero.

🔐 Autenticación

Requerida

Authorization: Bearer <TOKEN>
📌 Parámetro
id: ID de la reserva
⚙️ Lógica interna
Verifica que la reserva exista
Verifica que el usuario autenticado sea el conductor de la ruta asociada
Cambia el estado de la reserva a CONFIRMED
📤 Respuesta
{
  "_id": "reservationId",
  "status": "CONFIRMED"
}
⚠️ Validaciones
Solo el conductor puede aceptar solicitudes
No se puede aceptar una reserva ya procesada

### Rechazar solicitud

PATCH /reservations/:id/reject → Rechazar solicitud

Permite al conductor rechazar una solicitud de reserva.

🔐 Autenticación

Requerida

Authorization: Bearer <TOKEN>
📌 Parámetro
id: ID de la reserva
⚙️ Lógica interna
Verifica que la reserva exista
Verifica que el usuario autenticado sea el conductor de la ruta
Cambia el estado de la reserva a REJECTED
Libera el cupo (incrementa availableSeats si ya se había reservado)
📤 Respuesta
{
  "_id": "reservationId",
  "status": "REJECTED"
}
⚠️ Validaciones
Solo el conductor puede rechazar solicitudes
No se puede rechazar una reserva ya confirmada o cancelada

### Cancelar reserva

DELETE /reservations/:id  

Permite cancelar una reserva existente.

🔐 Autenticación

Requerida

📌 Parámetro
id: ID de la reserva
⚙️ Lógica interna
Busca la reserva
Cambia estado a CANCELLED
Incrementa availableSeats en la ruta
📤 Respuesta
{
  "_id": "reservationId",
  "status": "CANCELLED"
}
⚠️ Manejo de Errores
Ejemplos comunes
Ruta no encontrada
{
  "error": "Route not found"
}
Sin cupos disponibles
{
  "error": "No seats available"
}
Token inválido
{
  "message": "Invalid token"
}
🔐 Notas de Seguridad
Todos los endpoints protegidos usan JWT
El user.id se obtiene del token
Se recomienda validar roles:
driver → crear rutas
passenger → crear reservas
🚀 Recomendación Técnica (Importante)

Para evitar sobreventa de cupos en escenarios concurrentes, usar operación atómica:

Route.findOneAndUpdate(
  { _id: routeId, availableSeats: { $gt: 0 } },
  { $inc: { availableSeats: -1 } }
);
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

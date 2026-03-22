# Routes & Reservations Service

## Descripción General

El **Routes & Reservations Service** es un microservicio encargado de
gestionar la creación de rutas y la administración completa del ciclo de
vida de reservas dentro del sistema **UniWheels**.

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

-   Node.js
-   Express.js
-   MongoDB
-   Mongoose
-   JWT
-   Docker

------------------------------------------------------------------------

# Endpoints

## Rutas

-   POST /routes
-   DELETE /routes/:id
-   GET /routes/available

## Reservas

-   POST /reservations/request
-   PATCH /reservations/:id/accept
-   PATCH /reservations/:id/reject
-   DELETE /reservations/:id

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

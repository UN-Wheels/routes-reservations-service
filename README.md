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

-   Creación y edición de rutas por parte de conductores
-   Reglas de disponibilidad por fecha (fechas concretas o recurrencia semanal) y cupos por día
-   Consulta de rutas publicadas con cupos futuros y calendario de cupos por ruta
-   Solicitudes y confirmación de reservas por fecha de viaje
-   Listados para conductor y pasajero (pendientes, confirmadas, historial)
-   Cancelación de reservas por el pasajero

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
  "origin": { "name": "string", "lat": "number", "lng": "number" },
  "destination": { "name": "string", "lat": "number", "lng": "number" },
  "departureTime": "date",
  "pricePerSeat": "number (>= 0)",
  "status": "ACTIVE | IN PROGRESS | COMPLETED | INACTIVE"
}
```

Los cupos por día no van en el documento de la ruta: se generan a partir de **reglas de disponibilidad** (`RouteAvailabilityRule`) y se materializan en **slots** (`RouteDateSlot`).

## Reservation

``` json
{
  "routeId": "ObjectId",
  "passengerId": "string",
  "travelDate": "date (inicio del día UTC)",
  "status": "PENDING | CONFIRMED | REJECTED | CANCELLED"
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
    │   ├── route.js
    │   ├── reservation.js
    │   ├── routeAvailabilityRule.js
    │   └── routeDateSlot.js
    │
    ├── routes/
    │   ├── routeRoutes.js
    │   └── reservationRoutes.js
    │
    ├── services/
    │   ├── routeService.js
    │   ├── reservationService.js
    │   └── availabilityService.js
    │
    ├── utils/
    │   └── dateUtils.js
    │
    └── server.js
    │
    ├── Dockerfile
    ├── package.json
    └── README.md

------------------------------------------------------------------------


# Endpoints

Prefijos montados en `server.js`:

-   Rutas de transporte: **`/routes`**
-   Reservas: **`/reservations`**
-   Salud del servicio: **`/health`** (raíz de la app)

En las rutas protegidas, el identificador del usuario sale del JWT (`req.user.id`), usado como `driverId` o `passengerId` según el caso.

---

## Estado del servicio

### Comprobar salud

`GET /health`

Comprueba que el proceso responde.

🔐 Autenticación: no requerida.

📤 Respuesta `200`:

```json
{ "status": "OK" }
```

---

## Rutas (`/routes`)

### Crear ruta

`POST /routes`

Crea una ruta nueva. El `driverId` se toma del token.

🔐 Autenticación: requerida (`Authorization: Bearer <TOKEN>`).

📥 Body (ejemplo):

```json
{
  "origin": { "name": "Chapinero", "lat": 4.6486, "lng": -74.0651 },
  "destination": { "name": "Universidad Nacional", "lat": 4.6351, "lng": -74.0703 },
  "departureTime": "2026-03-20T07:30:00.000Z",
  "pricePerSeat": 5000,
  "status": "ACTIVE"
}
```

-   **`pricePerSeat`**: obligatorio, número ≥ 0.
-   **`status`**: opcional; si envías `"INACTIVE"`, la ruta queda inactiva; en caso contrario queda **`ACTIVE`**.

📤 Respuesta **`201`**: documento de ruta enriquecido con `mapLinks` (Google / Apple Maps) y `routePreview` (GeoJSON `LineString` entre origen y destino).

Errores frecuentes: **`400`** si falta o es inválido `pricePerSeat`; **`500`** en fallo interno.

---

### Mis rutas (conductor)

`GET /routes/me`

Lista todas las rutas del usuario autenticado (conductor), más recientes primero, con `mapLinks` y `routePreview`.

🔐 Autenticación: requerida.

📤 Respuesta **`200`**: array de rutas.

---

### Rutas publicadas con cupos futuros

`GET /routes/available`

Lista rutas en estado **`ACTIVE`** que tienen al menos un día futuro con cupos libres (según slots y reservas/solicitudes `PENDING` + `CONFIRMED`).

🔐 Autenticación: no requerida.

📤 Respuesta **`200`**: array de rutas enriquecidas.

---

### Obtener ruta por ID

`GET /routes/:id`

Devuelve una ruta por su `_id`, con `mapLinks` y `routePreview`.

🔐 Autenticación: no requerida.

📌 Parámetro: **`id`**, ID de la ruta.

📤 Respuesta **`200`**: objeto ruta. **`404`** si no existe (`{ "error": "Route not found" }`).

---

### Cupos por calendario (público)

`GET /routes/:id/slots`

Devuelve, para una ruta **`ACTIVE`**, los días con cupo configurado y el uso aproximado: `totalSeats`, `usedSeats` (solicitudes y reservas `PENDING` + `CONFIRMED` ese día) y `availableSeats`.

🔐 Autenticación: no requerida.

📌 Parámetro de ruta: **`id`**.

📥 Query (opcional):

-   **`from`**: inicio del rango de fechas (si se omite, desde hoy en UTC).
-   **`to`**: fin del rango (si se omite, hasta ~90 días desde `from`).

📤 Respuesta **`200`**: array de objetos `{ date, totalSeats, usedSeats, availableSeats }`.

**`404`**: ruta inexistente (`Route not found`) o no disponible (`Route not available` si no está `ACTIVE`).

---

### Disponibilidad y reglas (solo conductor de la ruta)

`GET /routes/:id/availability`

Devuelve las **reglas de disponibilidad** de la ruta y los **slots** calculados con ocupación en un rango de fechas.

🔐 Autenticación: requerida (solo el dueño de la ruta).

📥 Query (opcional): **`from`**, **`to`** (mismo criterio que slots; si `to` se omite, ~180 días desde `from`).

📤 Respuesta **`200`**: objeto con `rules` (documentos tal como los persiste Mongoose) y `slots` (cupos agregados por día en el rango). Ejemplo con una regla de fechas concretas y otra semanal:

```json
{
  "rules": [
    {
      "_id": "680a1c2e4f2b1a001234abcd",
      "routeId": "680a1b004f2b1a0012345678",
      "kind": "SPECIFIC_DATES",
      "specificEntries": [
        { "date": "2026-04-20T00:00:00.000Z", "seats": 4 },
        { "date": "2026-04-21T00:00:00.000Z", "seats": 4 }
      ],
      "createdAt": "2026-04-18T10:00:00.000Z",
      "updatedAt": "2026-04-18T10:00:00.000Z",
      "__v": 0
    },
    {
      "_id": "680a1c404f2b1a001234abce",
      "routeId": "680a1b004f2b1a0012345678",
      "kind": "WEEKLY_RECURRENCE",
      "weekdays": [1, 3, 5],
      "rangeStart": "2026-04-01T00:00:00.000Z",
      "rangeEnd": "2026-06-30T00:00:00.000Z",
      "seatsPerOccurrence": 3,
      "createdAt": "2026-04-18T10:05:00.000Z",
      "updatedAt": "2026-04-18T10:05:00.000Z",
      "__v": 0
    }
  ],
  "slots": [
    {
      "date": "2026-04-20T00:00:00.000Z",
      "totalSeats": 7,
      "usedSeats": 1,
      "availableSeats": 6
    },
    {
      "date": "2026-04-22T00:00:00.000Z",
      "totalSeats": 3,
      "usedSeats": 0,
      "availableSeats": 3
    }
  ]
}
```

Notas:

-   En **`SPECIFIC_DATES`**, la API recibe `entries` en el body, pero en base de datos y en esta respuesta el campo es **`specificEntries`**.
-   En **`WEEKLY_RECURRENCE`**, los campos **`weekdays`**, **`rangeStart`**, **`rangeEnd`** y **`seatsPerOccurrence`** solo aplican a ese `kind`; `specificEntries` suele omitirse o ir vacío en JSON.
-   **`totalSeats`** en cada fila de `slots` es la suma de cupos de todas las reglas que cubren ese día; **`usedSeats`** cuenta reservas y solicitudes **`PENDING`** + **`CONFIRMED`** ese día.

**`403`**: no eres el conductor (`Unauthorized`). **`404`**: ruta no encontrada.

---

### Añadir regla de disponibilidad

`POST /routes/:id/availability/rules`

Crea una regla y **recalcula** todos los `RouteDateSlot` de esa ruta.

🔐 Autenticación: requerida (solo el dueño).

📥 Body — **`kind: "SPECIFIC_DATES"`**:

```json
{
  "kind": "SPECIFIC_DATES",
  "entries": [
    { "date": "2026-04-20T00:00:00.000Z", "seats": 4 },
    { "date": "2026-04-21T00:00:00.000Z", "seats": 4 }
  ]
}
```

📥 Body — **`kind: "WEEKLY_RECURRENCE"`**:

-   **`weekdays`**: array de enteros **1 = lunes … 7 = domingo** (obligatorio, no vacío).
-   **`rangeStart`**, **`rangeEnd`**: límites del rango (obligatorios).
-   **`seatsPerOccurrence`**: cupos por cada día que coincida (≥ 1).

```json
{
  "kind": "WEEKLY_RECURRENCE",
  "weekdays": [1, 3, 5],
  "rangeStart": "2026-04-01T00:00:00.000Z",
  "rangeEnd": "2026-06-30T00:00:00.000Z",
  "seatsPerOccurrence": 3
}
```

📤 Respuesta **`201`**: documento de la regla recién creada (Mongoose serializa fechas y ObjectId en ISO string / hex).

**Tras crear `SPECIFIC_DATES`:**

```json
{
  "_id": "680a1c2e4f2b1a001234abcd",
  "routeId": "680a1b004f2b1a0012345678",
  "kind": "SPECIFIC_DATES",
  "specificEntries": [
    { "date": "2026-04-20T00:00:00.000Z", "seats": 4 },
    { "date": "2026-04-21T00:00:00.000Z", "seats": 4 }
  ],
  "createdAt": "2026-04-18T12:00:00.000Z",
  "updatedAt": "2026-04-18T12:00:00.000Z",
  "__v": 0
}
```

**Tras crear `WEEKLY_RECURRENCE`:**

```json
{
  "_id": "680a1d104f2b1a001234abff",
  "routeId": "680a1b004f2b1a0012345678",
  "kind": "WEEKLY_RECURRENCE",
  "weekdays": [1, 3, 5],
  "rangeStart": "2026-04-01T00:00:00.000Z",
  "rangeEnd": "2026-06-30T00:00:00.000Z",
  "seatsPerOccurrence": 3,
  "createdAt": "2026-04-18T12:10:00.000Z",
  "updatedAt": "2026-04-18T12:10:00.000Z",
  "__v": 0
}
```

Errores **`400`** por validación; **`403`** / **`404`** como en otros endpoints del conductor.

---

### Eliminar regla de disponibilidad

`DELETE /routes/:id/availability/rules/:ruleId`

Elimina la regla indicada y **vuelve a generar** los slots de la ruta.

🔐 Autenticación: requerida (solo el dueño).

📌 Parámetros: **`id`** (ruta), **`ruleId`** (regla).

📤 Respuesta **`200`**: `{ "deleted": true }`. **`404`**: ruta o regla no encontrada; **`403`** si no eres el dueño.

---

### Actualizar ruta

`PATCH /routes/:id`

Actualiza campos opcionales: `origin`, `destination`, `departureTime`, `pricePerSeat` (≥ 0), `status` (**`ACTIVE`** o **`INACTIVE`** solamente).

🔐 Autenticación: requerida (solo el dueño).

📤 Respuesta **`200`**: ruta actualizada enriquecida. **`403`** / **`404`** según corresponda; **`400`** si `pricePerSeat` o `status` son inválidos.

---

### Eliminar ruta

`DELETE /routes/:id`

Elimina la ruta y en **cascada** reglas de disponibilidad, slots y todas las reservas asociadas a esa ruta.

🔐 Autenticación: requerida (solo el dueño).

📤 Respuesta **`200`**: `{ "deleted": true, "id": "<routeId>" }`.

---

## Reservas (`/reservations`)

### Solicitudes pendientes (conductor)

`GET /reservations/me/driver/requests`

Reservas en estado **`PENDING`** cuya ruta pertenece al conductor autenticado. Cada ítem incluye `routeId` poblado.

🔐 Autenticación: requerida.

---

### Reservas confirmadas (conductor)

`GET /reservations/me/driver/confirmed`

Misma idea que la anterior, filtrando estado **`CONFIRMED`**.

🔐 Autenticación: requerida.

---

### Mis solicitudes como pasajero

`GET /reservations/me/passenger/requests`

Listado de reservas del pasajero con estado **`PENDING`** o **`REJECTED`**, con `routeId` poblado.

🔐 Autenticación: requerida.

---

### Mis viajes confirmados (próximos)

`GET /reservations/me/passenger/confirmed`

Reservas **`CONFIRMED`** del pasajero con **`travelDate`** ≥ hoy (inicio del día UTC), ordenadas por fecha ascendente.

🔐 Autenticación: requerida.

---

### Historial de viajes (pasajero)

`GET /reservations/me/passenger/history`

Reservas **`CONFIRMED`** con **`travelDate`** anterior a hoy (UTC), orden descendente por fecha.

🔐 Autenticación: requerida.

---

### Solicitar reserva (fecha concreta)

`POST /reservations/request`

Crea una solicitud **`PENDING`** para un día en el que la ruta tenga slot y cupo libre. No puede haber ya otra solicitud o reserva **`PENDING`** / **`CONFIRMED`** del mismo pasajero para la misma ruta y fecha.

🔐 Autenticación: requerida.

📥 Body:

```json
{
  "routeId": "65f0c2bfa29a0b6c0d0a1234",
  "travelDate": "2026-04-22T00:00:00.000Z"
}
```

-   **`travelDate`**: obligatorio (se normaliza al inicio del día en UTC).

📤 Respuesta **`201`**: documento de reserva (incluye `travelDate`, `status: "PENDING"`, timestamps).

**`400`** ejemplos: ruta no disponible, fecha sin slot, sin cupos, fecha omitida, o mensaje tipo *"You already have a pending or confirmed request for this date"*.

---

### Aceptar solicitud

`PATCH /reservations/:id/accept`

El conductor de la ruta pasa la reserva de **`PENDING`** a **`CONFIRMED`** si la ruta sigue activa y sigue habiendo cupo lógico para esa fecha.

🔐 Autenticación: requerida.

📌 Parámetro: **`id`**, ID de la reserva.

📤 Respuesta **`200`**: reserva actualizada. **`403`** / **`404`**; **`400`** si no está pendiente, la ruta no está activa, o no hay cupo disponible para la fecha.

---

### Rechazar solicitud

`PATCH /reservations/:id/reject`

El conductor marca la solicitud como **`REJECTED`** (solo si estaba **`PENDING`**). El cupo del día queda libre para otros pasajeros.

🔐 Autenticación: requerida.

📤 Respuesta **`200`**: reserva con `status: "REJECTED"`. Errores **`403`**, **`404`**, **`400`** (p. ej. solo se rechazan pendientes).

---

### Cancelar reserva (pasajero)

`DELETE /reservations/:id`

Solo el **pasajero** dueño de la reserva puede cancelar. Estado pasa a **`CANCELLED`** (si ya estaba cancelada o rechazada, se devuelve sin cambio efectivo).

🔐 Autenticación: requerida.

📤 Respuesta **`200`**: reserva. **`403`** si no eres el pasajero; **`404`** si no existe la reserva.

---

## Manejo de errores (referencia)

Respuestas típicas en JSON:

```json
{ "error": "Route not found" }
```

```json
{ "error": "Unauthorized" }
```

```json
{ "error": "No seats available for this date" }
```

En `middleware/auth.js`, sin cabecera de autorización: **`401`** `{ "message": "No token provided" }`. Token inválido o expirado: **`401`** `{ "message": "Invalid token" }`.

---

## Notas de seguridad

-   Los endpoints marcados como protegidos esperan **`Authorization: Bearer <JWT>`**.
-   El **`user.id`** del token identifica al conductor o al pasajero según el endpoint.

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

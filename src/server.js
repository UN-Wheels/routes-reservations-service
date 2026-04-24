require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const rabbit = require("./config/rabbitmq");

const routeRoutes = require("./routes/routeRoutes");
const reservationRoutes = require("./routes/reservationRoutes");

connectDB();
rabbit.connect().catch((err) => console.error("[RabbitMQ] Error inicial:", err.message));

const app = express();

app.use(cors());
app.use(express.json());

app.use("/routes", routeRoutes);
app.use("/reservations", reservationRoutes);

app.listen(process.env.PORT, () => {
  console.log("Routes & Reservations Service running");
});

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});


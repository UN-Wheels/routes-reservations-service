require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const rabbit = require("./config/rabbitmq");

const routeRoutes = require("./routes/routeRoutes");
const reservationRoutes = require("./routes/reservationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.use("/routes", routeRoutes);
app.use("/reservations", reservationRoutes);

async function start() {
  await connectDB();
  try {
    await rabbit.connect();
  } catch (err) {
    console.error("[RabbitMQ] Error inicial:", err.message);
  }

  app.listen(process.env.PORT, () => {
    console.log("Routes & Reservations Service running");
  });
}

start().catch((err) => {
  console.error("No se pudo iniciar routes-reservations-service:", err.message);
  process.exit(1);
});

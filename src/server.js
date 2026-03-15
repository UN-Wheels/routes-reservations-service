require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const connectDB = require("./config/db");
const trackingRoutes = require("./routes/trackingRoutes");
const initSocket = require("./sockets/trackingSocket");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/tracking", trackingRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

initSocket(io);

server.listen(process.env.PORT, () => {
  console.log(`Tracking Service running on port ${process.env.PORT}`);
});
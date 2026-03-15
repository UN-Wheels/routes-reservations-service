const ActiveTrip = require("../models/ActiveTrip");

module.exports = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const decoded = require("jsonwebtoken").verify(
        token,
        process.env.JWT_SECRET
      );
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    console.log("Client connected");

    socket.on("joinTrip", (tripId) => {
      socket.join(tripId);
    });

    socket.on("driverLocation", async (data) => {
      const { tripId, lat, lng } = data;

      const location = {
        lat,
        lng,
        timestamp: new Date()
      };

      await ActiveTrip.findOneAndUpdate(
        { tripId },
        { currentLocation: location }
      );

      io.to(tripId).emit("locationUpdate", location);
    });
  });
};
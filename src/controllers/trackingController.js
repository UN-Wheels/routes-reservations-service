const trackingService = require("../services/trackingService");

exports.startTrip = async (req, res) => {
  try {
    const { tripId } = req.body;
    const driverId = req.user.id;

    const trip = await trackingService.startTrip(tripId, driverId);
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.endTrip = async (req, res) => {
  try {
    const { tripId } = req.body;
    const result = await trackingService.endTrip(tripId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
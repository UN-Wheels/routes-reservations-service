const reservationService = require("../services/reservationService");

exports.createReservation = async (req, res) => {

  try {

    const passengerId = req.user.id;

    const reservation = await reservationService.createReservation(
      req.body.routeId,
      passengerId
    );

    res.json(reservation);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }
};

exports.cancelReservation = async (req, res) => {

  try {

    const reservation = await reservationService.cancelReservation(
      req.params.id
    );

    res.json(reservation);

  } catch (err) {

    res.status(500).json({ error: err.message });

  }
};
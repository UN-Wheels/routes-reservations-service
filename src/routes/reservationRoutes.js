const express = require("express");
const router = express.Router();
const controller = require("../controllers/reservationController");
const auth = require("../middleware/auth");

router.post("/", auth, controller.createReservation);

router.delete("/:id", auth, controller.cancelReservation);

module.exports = router;
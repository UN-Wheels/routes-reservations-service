const express = require("express");
const router = express.Router();
const controller = require("../controllers/reservationController");
const auth = require("../middleware/auth");

router.post("/reservations/request", auth, controller.requestReservation);
router.patch("/reservations/:id/accept", auth, controller.acceptReservation);
router.patch("/reservations/:id/reject", auth, controller.rejectReservation);
router.delete("/reservations/:id", auth, controller.cancelReservation);

module.exports = router;
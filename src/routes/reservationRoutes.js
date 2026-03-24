const express = require("express");
const router = express.Router();
const controller = require("../controllers/reservationController");
const auth = require("../middleware/auth");

router.post("/request", auth, controller.requestReservation);
router.patch("/:id/accept", auth, controller.acceptReservation);
router.patch("/:id/reject", auth, controller.rejectReservation);
router.delete("/:id", auth, controller.cancelReservation);

module.exports = router;
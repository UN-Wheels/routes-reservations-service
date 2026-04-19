const express = require("express");
const router = express.Router();
const controller = require("../controllers/reservationController");
const auth = require("../middleware/auth");

router.get("/me/driver/requests", auth, controller.listDriverRequests);
router.get("/me/driver/confirmed", auth, controller.listDriverConfirmed);

router.get("/me/passenger/requests", auth, controller.listPassengerRequests);
router.get("/me/passenger/confirmed", auth, controller.listPassengerConfirmed);
router.get("/me/passenger/history", auth, controller.listPassengerHistory);

router.post("/request", auth, controller.requestReservation);
router.patch("/:id/accept", auth, controller.acceptReservation);
router.patch("/:id/reject", auth, controller.rejectReservation);
router.delete("/:id", auth, controller.cancelReservation);

module.exports = router;

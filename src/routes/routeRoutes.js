const express = require("express");
const router = express.Router();
const controller = require("../controllers/routeController");
const auth = require("../middleware/auth");

router.post("/", auth, controller.createRoute);
router.get("/me", auth, controller.getMyRoutes);
router.get("/available", controller.getRoutes);

router.get("/:id/slots", controller.getRouteSlotsPublic);
router.get("/:id/availability", auth, controller.getRouteAvailability);
router.post("/:id/availability/rules", auth, controller.addAvailabilityRule);
router.delete("/:id/availability/rules/:ruleId", auth, controller.deleteAvailabilityRule);

router.patch("/:id", auth, controller.updateRoute);
router.delete("/:id", auth, controller.deleteRoute);
router.get("/:id", controller.getRouteById);

module.exports = router;

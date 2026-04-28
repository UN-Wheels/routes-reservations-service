const express = require("express");
const router = express.Router();
const controller = require("../controllers/routeController");
const auth = require("../middleware/auth");

router.post("/", auth, controller.createRoute);
router.get("/me", auth, controller.getMyRoutes);
router.get("/available", controller.getRoutes);

// 🗺️ Endpoints de información geográfica
router.get("/geo/university-entrances", controller.getUniversityEntrances);
router.get("/geo/cundinamarca-bounds", controller.getCundinamarcaBounds);

router.get("/:id/slots", controller.getRouteSlotsPublic);
router.get("/:id/availability", auth, controller.getRouteAvailability);
router.post("/:id/availability/rules", auth, controller.addAvailabilityRule);
router.delete("/:id/availability/rules/:ruleId", auth, controller.deleteAvailabilityRule);

router.patch("/:id", auth, controller.updateRoute);
router.delete("/:id", auth, controller.deleteRoute);
router.get("/:id", controller.getRouteById);

// 🚀 Iniciar ruta y calcular mejor secuencia
router.post("/:id/start", auth, controller.startRoute);

// 📊 Obtener detalles de la ruta optimizada
router.get("/:id/optimized", auth, controller.getOptimizedRouteDetails);

module.exports = router;

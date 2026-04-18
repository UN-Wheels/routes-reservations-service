const express = require("express");
const router = express.Router();
const controller = require("../controllers/routeController");
const auth = require("../middleware/auth");

router.post("/", auth, controller.createRoute);
router.get("/available", controller.getRoutes);
router.get("/:id", controller.getRouteById);
router.delete("/:id", auth, controller.cancelRoute);

// 🚀 Iniciar ruta y calcular mejor secuencia
router.post("/:id/start", auth, controller.startRoute);

// 📊 Obtener detalles de la ruta optimizada
router.get("/:id/optimized", auth, controller.getOptimizedRouteDetails);

module.exports = router;
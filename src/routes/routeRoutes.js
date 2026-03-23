const express = require("express");
const router = express.Router();
const controller = require("../controllers/routeController");
const auth = require("../middleware/auth");

router.post("/routes", auth, controller.createRoute);
router.get("/routes/available", controller.getRoutes);
router.delete("/routes/:id", auth, controller.cancelRoute);

module.exports = router;
const express = require("express");
const router = express.Router();
const controller = require("../controllers/routeController");
const auth = require("../middleware/auth");

router.post("/", auth, controller.createRoute);
router.get("/", controller.getRoutes);

module.exports = router;
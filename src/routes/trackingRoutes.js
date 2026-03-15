const express = require("express");
const router = express.Router();
const controller = require("../controllers/trackingController");
const auth = require("../middleware/auth");

router.post("/start", auth, controller.startTrip);
router.post("/end", auth, controller.endTrip);

module.exports = router;
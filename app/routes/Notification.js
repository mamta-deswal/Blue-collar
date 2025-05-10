const express = require("express");
const notificationController = require("../controllers/Notification");

const router = express.Router();

router.post("/send-notification", notificationController.sendNotification);

module.exports = router;

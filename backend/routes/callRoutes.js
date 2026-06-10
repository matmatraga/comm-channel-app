const express = require("express");
const router = express.Router();
const callController = require("../controllers/callController");
const { verifyToken } = require("../middlewares/auth");

router.post("/start", verifyToken, callController.startCall);
router.post("/accept", verifyToken, callController.acceptCall);
router.post("/decline", verifyToken, callController.declineCall);
router.post("/end", verifyToken, callController.endCall);
router.get("/history/:partnerId", verifyToken, callController.getCallHistory);

module.exports = router;

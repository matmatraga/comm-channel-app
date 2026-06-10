const CallLog = require("../models/CallLog");
const User = require("../models/User");
const { emitToUser } = require("../middlewares/io");

exports.startCall = async (req, res) => {
  try {
    const { partnerId, type } = req.body;
    if (!partnerId || !type) {
      return res.status(400).json({ error: "partnerId and type are required" });
    }

    const partner = await User.findById(partnerId);
    if (!partner) return res.status(404).json({ error: "Partner not found" });

    const call = await CallLog.create({
      caller: req.user.id,
      callee: partnerId,
      roomName: "pending",
      type,
      status: "ringing",
    });
    call.roomName = call._id.toString();
    await call.save();

    const io = req.app.get("io");
    emitToUser(io, partnerId, "call_invite", {
      callId: call._id,
      caller: { _id: req.user.id, name: req.user.name },
      type,
    });

    res.status(200).json({
      callId: call._id,
      type: call.type,
      displayName: req.user.name,
      partnerId,
    });
  } catch (err) {
    console.error("[START CALL ERROR]", err);
    res.status(500).json({ error: err.message || "Failed to start call" });
  }
};

exports.acceptCall = async (req, res) => {
  try {
    const { callId } = req.body;
    const call = await CallLog.findById(callId);

    if (!call) return res.status(404).json({ error: "Call not found" });
    if (call.callee.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    call.status = "accepted";
    call.startedAt = new Date();
    await call.save();

    const io = req.app.get("io");
    emitToUser(io, call.caller.toString(), "call_accepted", { callId });

    res.status(200).json({
      callId: call._id,
      type: call.type,
      displayName: req.user.name,
      partnerId: call.caller.toString(),
    });
  } catch (err) {
    console.error("[ACCEPT CALL ERROR]", err);
    res.status(500).json({ error: "Failed to accept call" });
  }
};

exports.declineCall = async (req, res) => {
  try {
    const { callId } = req.body;
    const call = await CallLog.findById(callId);

    if (!call) return res.status(404).json({ error: "Call not found" });

    call.status = "declined";
    call.endedAt = new Date();
    await call.save();

    const io = req.app.get("io");
    emitToUser(io, call.caller.toString(), "call_declined", { callId });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("[DECLINE CALL ERROR]", err);
    res.status(500).json({ error: "Failed to decline call" });
  }
};

exports.endCall = async (req, res) => {
  try {
    const { callId } = req.body;
    const call = await CallLog.findById(callId);

    if (!call) return res.status(404).json({ error: "Call not found" });

    if (call.status === "ringing") call.status = "missed";
    else if (call.status === "accepted") call.status = "completed";

    call.endedAt = new Date();
    if (call.startedAt) {
      call.duration = Math.floor((call.endedAt - call.startedAt) / 1000);
    }
    await call.save();

    const partnerId =
      call.caller.toString() === req.user.id.toString()
        ? call.callee.toString()
        : call.caller.toString();

    const io = req.app.get("io");
    emitToUser(io, partnerId, "call_ended", { callId });

    res.status(200).json({ success: true, call });
  } catch (err) {
    console.error("[END CALL ERROR]", err);
    res.status(500).json({ error: "Failed to end call" });
  }
};

exports.getCallHistory = async (req, res) => {
  try {
    const { partnerId } = req.params;
    const calls = await CallLog.find({
      $or: [
        { caller: req.user.id, callee: partnerId },
        { caller: partnerId, callee: req.user.id },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ calls });
  } catch (err) {
    console.error("[CALL HISTORY ERROR]", err);
    res.status(500).json({ error: "Failed to fetch call history" });
  }
};

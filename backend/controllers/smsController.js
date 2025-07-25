const SMS = require("../models/SMS");
const { sendSMS } = require("../services/smsService");
const { MessagingResponse } = require("twilio").twiml;

exports.sendTextMessage = async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    return res
      .status(400)
      .json({ error: "Recipient number and message are required." });
  }

  try {
    // Save to database before sending
    const saved = await SMS.create({
      from: "You", // optionally replace with req.user.phone if available
      to,
      body: message,
      status: "sent",
      receivedAt: new Date(),
    });

    // Send via Twilio
    const response = await sendSMS(to, message);

    res.status(200).json({
      success: true,
      sid: response.sid,
      message: {
        from: "You",
        to,
        body: message,
        status: "sent",
        receivedAt: saved.receivedAt,
      },
    });
  } catch (err) {
    console.error("[SEND SMS ERROR]", err);
    res.status(500).json({ error: "Failed to send SMS." });
  }
};

exports.receiveSMS = async (req, res) => {
  try {
    const { From, To, Body } = req.body;

    if (!From || !To || !Body) {
      return res.status(400).send("Invalid SMS data.");
    }

    // Save incoming SMS
    const saved = await SMS.create({
      from: From,
      to: To,
      body: Body,
      status: "received",
      receivedAt: new Date(),
    });

    // Emit to frontend
    req.io.emit("incoming_sms", {
      from: From,
      to: To,
      body: Body,
      status: "received",
      receivedAt: saved.receivedAt,
    });

    const twiml = new MessagingResponse();
    res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error("[RECEIVE SMS ERROR]", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.getSMSHistory = async (req, res) => {
  try {
    const messages = await SMS.find().sort({ receivedAt: 1 });

    // Group messages by contact (e.g., based on `to` or `from`)
    const grouped = {};
    messages.forEach((msg) => {
      const contact = msg.status === "sent" ? msg.to : msg.from;
      if (!grouped[contact]) grouped[contact] = [];

      grouped[contact].push({
        from: msg.from,
        to: msg.to,
        body: msg.body,
        status: msg.status,
        receivedAt: msg.receivedAt,
      });
    });

    res.status(200).json(grouped);
  } catch (error) {
    console.error("[GET SMS HISTORY ERROR]", error);
    res.status(500).json({ error: "Failed to fetch SMS history" });
  }
};

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Device } from "@twilio/voice-sdk";

const VoicePage = () => {
  const [phone, setPhone] = useState("");
  const [calls, setCalls] = useState([]);
  const deviceRef = useRef(null);

  const fetchCallHistory = async () => {
    try {
      const res = await axios.get(
        "https://omni-channel-app.onrender.com/api/voice/history"
      );
      setCalls(res.data);
    } catch (err) {
      console.error("❌ Failed to load call history:", err);
    }
  };

  const makeCall = async (e) => {
    e.preventDefault();
    try {
      const identity = phone.startsWith("+") ? phone : `client:${phone}`; // ✅ If not a number, assume it's an identity
      console.log("📞 Making call to:", identity);

      await axios.post("https://omni-channel-app.onrender.com/api/voice/call", {
        to: identity,
      });
      setPhone("");
      fetchCallHistory();
    } catch (err) {
      console.error("❌ [CALL ERROR]", err);
    }
  };

  const initTwilioDevice = async () => {
    try {
      let identity = localStorage.getItem("identity");
      identity = "anonymous";
      if (!identity) {
        localStorage.setItem("identity", identity);
      }

      console.log("🔑 Using identity:", identity);

      const res = await axios.get(
        `https://omni-channel-app.onrender.com/api/voice/token?identity=${identity}`
      );
      const token = res.data.token;

      const device = new Device(token, {
        codecPreferences: ["opus", "pcmu"],
        fakeLocalDTMF: true,
        enableRingingState: true,
        logLevel: 1,
      });

      device.on("registered", () => {
        console.log("[✅ Twilio Device] Registered");
      });

      device.on("ready", () => {
        console.log("[✅ Twilio Device] Ready to receive calls");
      });

      device.on("error", (error) => {
        console.error("[❌ Twilio Device Error]", error);
      });

      device.on("incoming", (call) => {
        console.log("[📲 Incoming Call]", call.parameters);
        if (window.confirm("📞 Incoming call. Accept?")) {
          call.accept();
        } else {
          call.reject();
        }
      });

      device.on("connect", () => {
        console.log("[🔗 Twilio Device] Call connected");
      });

      device.on("disconnect", () => {
        console.log("[🔚 Twilio Device] Call ended");
        fetchCallHistory();
      });

      deviceRef.current = device;

      device.register(); // ⬅️ THIS IS CRUCIAL
      console.log("📟 Twilio Device initialized and registered");
    } catch (err) {
      console.error(
        "❌ [INIT DEVICE ERROR]",
        err.response?.data || err.message
      );
    }
  };

  useEffect(() => {
    fetchCallHistory();
    initTwilioDevice();
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-3">📞 Voice Call</h3>

      <form onSubmit={makeCall} className="mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-10">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="+639XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-success w-100">Call</button>
          </div>
        </div>
      </form>

      <h5 className="mb-3">📜 Call History</h5>
      <ul className="list-group">
        {calls.map((call) => (
          <li
            className="list-group-item d-flex justify-content-between align-items-center"
            key={call.callSid}
          >
            <div>
              <strong>
                {call.direction === "inbound" ? "Incoming" : "Outgoing"}:
              </strong>{" "}
              {call.from} ➡️ {call.to}
              <br />
              <small>
                Status: {call.status} | Duration: {call.duration || 0}s
              </small>
            </div>
            <small>{new Date(call.timestamp).toLocaleString()}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VoicePage;

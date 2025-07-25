import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Device } from "@twilio/voice-sdk";
import toast, { Toaster } from "react-hot-toast";

const VoicePage = () => {
  const [phone, setPhone] = useState("");
  const [calls, setCalls] = useState({});
  const [callDuration, setCallDuration] = useState(0);
  const deviceRef = useRef(null);
  const callTimerRef = useRef(null);

  const groupCallsByContact = (calls) => {
    const grouped = {};
    calls.forEach((call) => {
      const contact = [call.from, call.to]
        .filter((v) => v && v !== "client:anonymous")
        .sort()
        .join(" ↔ ");
      if (!grouped[contact]) grouped[contact] = [];
      grouped[contact].push(call);
    });
    return grouped;
  };

  const fetchCallHistory = async () => {
    try {
      const res = await axios.get(
        "https://omni-channel-app.onrender.com/api/voice/history"
      );
      const grouped = groupCallsByContact(res.data);
      setCalls(grouped);
    } catch (err) {
      console.error("❌ Failed to load call history:", err);
    }
  };

  const makeCall = async (e) => {
    e.preventDefault();
    try {
      const identity = phone.startsWith("+") ? phone : `client:${phone}`;
      await axios.post("https://omni-channel-app.onrender.com/api/voice/call", {
        to: identity,
      });
      setPhone("");
      fetchCallHistory();
    } catch (err) {
      console.error("❌ [CALL ERROR]", err);
    }
  };

  const startCallTimer = () => {
    setCallDuration(0);
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    toast.custom(
      (t) => (
        <div
          className="bg-green-600 text-white shadow-lg rounded-md px-4 py-2"
          style={{
            position: "fixed",
            top: "4.5rem",
            right: "1.5rem",
            zIndex: 1000,
          }}
        >
          ⏱️ Call Duration: 0:00
        </div>
      ),
      { id: "call-timer", duration: Infinity }
    );
  };

  const stopCallTimer = () => {
    clearInterval(callTimerRef.current);
    setCallDuration(0);
    toast.dismiss("call-timer");
  };

  const initTwilioDevice = async () => {
    try {
      let identity = localStorage.getItem("identity") || "anonymous";
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

      // Handle outgoing call connection
      device.on("connect", (call) => {
        console.log("📞 Outgoing Call Connected");
        startCallTimer();
        call.on("disconnect", () => {
          console.log("🔚 Outgoing Call Disconnected");
          stopCallTimer();
          fetchCallHistory();
        });
      });

      // Handle global disconnect
      device.on("disconnect", () => {
        stopCallTimer();
        fetchCallHistory();
      });

      // Incoming call handler with toast UI
      device.on("incoming", (call) => {
        const from = call.parameters.From;

        toast.custom(
          (t) => (
            <div
              className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-lg p-4 w-72"
              style={{
                animation: t.visible ? "fadeIn 0.3s" : "fadeOut 0.3s",
                position: "fixed",
                top: "4.5rem",
                right: "1.5rem",
                zIndex: 1000,
              }}
            >
              <p className="font-semibold mb-2 text-center">
                📞 Incoming Call from{" "}
                <span className="text-blue-600 dark:text-blue-300">{from}</span>
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => {
                    call.reject();
                    toast.dismiss(t.id);
                  }}
                  className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    call.accept();
                    startCallTimer();
                    toast.dismiss(t.id);

                    call.on("disconnect", () => {
                      console.log("🔚 Incoming Call Disconnected");
                      stopCallTimer();
                      fetchCallHistory();
                    });
                  }}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md"
                >
                  Accept
                </button>
              </div>
            </div>
          ),
          { id: "incoming-call-toast", duration: Infinity }
        );
      });

      device.register();
      deviceRef.current = device;
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

  useEffect(() => {
    if (callDuration > 0) {
      toast.custom(
        (t) => (
          <div
            className="bg-green-600 text-white shadow-lg rounded-md px-4 py-2"
            style={{
              position: "fixed",
              top: "4.5rem",
              right: "1.5rem",
              zIndex: 1000,
            }}
          >
            ⏱️ Call Duration: {Math.floor(callDuration / 60)}:
            {(callDuration % 60).toString().padStart(2, "0")}
          </div>
        ),
        { id: "call-timer", duration: Infinity }
      );
    }
  }, [callDuration]);

  return (
    <main className="min-h-screen py-10 px-4 bg-gradient-to-br from-blue-100 via-purple-100 to-white text-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-black dark:text-white transition-colors duration-300">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-center mb-4">📞 Voice Call</h2>

        {/* Call form */}
        <form
          onSubmit={makeCall}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4"
        >
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
              placeholder="+639XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            Call
          </button>
        </form>

        {/* Accordion Call History */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-4">📜 Call History</h3>
          {Object.entries(calls).length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No call history found.
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(calls).map(([contact, entries], idx) => (
                <div
                  key={contact}
                  className="border dark:border-gray-600 rounded-lg"
                >
                  <button
                    className="w-full text-left px-4 py-2 bg-gray-100 dark:bg-gray-700 font-semibold rounded-t-lg"
                    onClick={() => {
                      const el = document.getElementById(`panel-${idx}`);
                      el.classList.toggle("hidden");
                    }}
                  >
                    {contact}
                  </button>
                  <div
                    id={`panel-${idx}`}
                    className="hidden px-4 py-2 space-y-3"
                  >
                    {entries.map((call, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg shadow-sm text-sm ${
                          call.direction === "inbound"
                            ? "bg-gray-200 dark:bg-gray-600 text-left"
                            : "bg-blue-100 dark:bg-blue-800 text-right text-white"
                        }`}
                        style={{
                          maxWidth: "70%",
                          marginLeft: call.direction === "inbound" ? 0 : "auto",
                        }}
                      >
                        <div className="font-semibold mb-1">
                          {call.direction === "inbound" ? "From" : "To"}{" "}
                          {call.direction === "inbound" ? call.from : call.to}
                        </div>
                        <div className="text-xs">
                          Status: {call.status} <br />
                          Duration:{" "}
                          {call.duration && call.status === "completed"
                            ? `${call.duration}s`
                            : "—"}
                          <br />
                          {new Date(call.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default VoicePage;

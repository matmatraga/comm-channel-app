import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Send } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

const socket = io("https://omni-channel-app.onrender.com", {
  auth: { token: localStorage.getItem("token") || "" },
});

const SMSPage = () => {
  const [inbox, setInbox] = useState({});
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const { theme } = useTheme();

  useEffect(() => {
    socket.on("incoming_sms", ({ from, body }) => {
      setInbox((prev) => ({
        ...prev,
        [from]: [
          ...(prev[from] || []),
          {
            from,
            body,
            received: true,
            receivedAt: new Date().toLocaleString() || new Date().toISOString(),
          },
        ],
      }));
    });

    return () => {
      socket.off("incoming_sms");
    };
  }, []);

  const sendSMS = async (e) => {
    e.preventDefault();
    if (!to || !body) return;

    try {
      await axios.post("https://omni-channel-app.onrender.com/api/sms/send", {
        to,
        message: body,
      });

      setInbox((prev) => ({
        ...prev,
        [to]: [
          ...(prev[to] || []),
          {
            from: "You",
            body,
            received: false,
            receivedAt: new Date().toLocaleString(),
          },
        ],
      }));

      setBody("");
      toast.success("SMS sent successfully");
    } catch (err) {
      toast.error("Failed to send SMS");
      console.error("[SEND SMS ERROR]", err);
    }
  };

  return (
    <main
      className={`min-h-screen py-10 px-4 transition-colors duration-300 
        ${
          theme === "dark"
            ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white"
            : "bg-gradient-to-br from-blue-100 via-purple-100 to-white text-gray-900"
        }`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold mb-2 text-center">📩 SMS Messages</h2>

        <form
          onSubmit={sendSMS}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4"
        >
          {/* To field */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">To</label>
            <input
              type="tel"
              className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
              placeholder="+639XXXXXXXXX"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>

          {/* Message field */}
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">Message</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
              placeholder="Enter your message"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
          >
            Send
          </button>
        </form>

        <div className="space-y-4">
          {Object.entries(inbox).map(([sender, messages]) => (
            <div
              key={sender}
              className="bg-white dark:bg-gray-800 rounded-xl shadow p-4"
            >
              <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-3">
                Conversation with {sender}
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`mb-3 p-3 rounded-lg shadow-sm text-sm ${
                      msg.received
                        ? "bg-gray-100 text-left dark:bg-gray-700"
                        : "bg-blue-100 text-right dark:bg-blue-800 text-white"
                    }`}
                  >
                    <div className="mb-1 font-semibold">
                      {msg.received ? sender : "You"}{" "}
                      <span
                        className={`ml-2 text-xs font-medium ${
                          msg.received ? "text-green-500" : "text-blue-400"
                        }`}
                      >
                        {msg.received ? "Received" : "Sent"}
                      </span>
                    </div>
                    <div className="">{msg.body}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                      {msg.receivedAt || "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default SMSPage;

import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";
import { ChevronDown, ChevronUp } from "lucide-react";

const socket = io("https://omni-channel-app.onrender.com", {
  auth: { token: localStorage.getItem("token") || "" },
});

const SMSPage = () => {
  const [inbox, setInbox] = useState({});
  const [expandedSender, setExpandedSender] = useState(null); // 🔽 tracks expanded accordion
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const { theme } = useTheme();

  // Fetch SMS history on mount
  useEffect(() => {
    const fetchSMSHistory = async () => {
      try {
        const res = await axios.get(
          "https://omni-channel-app.onrender.com/api/sms/history",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const history = res.data;
        const formatted = {};
        Object.entries(history).forEach(([sender, messages]) => {
          formatted[sender] = messages.map((msg) => ({
            ...msg,
            receivedAt: new Date(msg.receivedAt).toLocaleString(),
          }));
        });

        setInbox(formatted);
      } catch (error) {
        toast.error("Failed to load SMS history");
        console.error("[FETCH SMS HISTORY ERROR]", error);
      }
    };

    fetchSMSHistory();

    socket.on("incoming_sms", ({ from, body, receivedAt }) => {
      setInbox((prev) => ({
        ...prev,
        [from]: [
          ...(prev[from] || []),
          {
            from,
            body,
            status: "received",
            receivedAt: new Date(receivedAt || Date.now()).toLocaleString(),
          },
        ],
      }));
    });

    return () => socket.off("incoming_sms");
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
            to,
            body,
            status: "sent",
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

  const toggleAccordion = (sender) => {
    setExpandedSender((prev) => (prev === sender ? null : sender));
  };

  return (
    <main
      className={`min-h-screen py-10 px-4 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white"
          : "bg-gradient-to-br from-blue-100 via-purple-100 to-white text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold mb-4 text-center">📩 SMS</h2>

        {/* Send Form */}
        <form
          onSubmit={sendSMS}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow space-y-4"
        >
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

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
          >
            Send
          </button>
        </form>

        {/* Accordion Section */}
        <div className="space-y-4">
          {Object.entries(inbox).map(([sender, messages]) => (
            <div
              key={sender}
              className="bg-white dark:bg-gray-800 rounded-xl shadow"
            >
              {/* Header */}
              <button
                className="w-full flex justify-between items-center px-4 py-3 font-semibold text-blue-600 dark:text-blue-400 focus:outline-none"
                onClick={() => toggleAccordion(sender)}
              >
                <span>Conversation with {sender}</span>
                {expandedSender === sender ? (
                  <ChevronUp className="w-5 h-5" />
                ) : (
                  <ChevronDown className="w-5 h-5" />
                )}
              </button>

              {/* Collapsible Messages */}
              {expandedSender === sender && (
                <div className="px-4 pb-4 space-y-2 max-h-64 overflow-y-auto">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`mb-3 p-3 rounded-lg shadow-sm text-sm
                      ${
                        msg.status === "received"
                          ? "bg-gray-100 text-left dark:bg-gray-700"
                          : "bg-blue-100 text-right dark:bg-blue-800 dark:text-white text-gray-800"
                      }`}
                    >
                      <div className="mb-1 font-semibold">
                        {msg.status === "received" ? sender : "You"}{" "}
                        <span
                          className={`ml-2 text-xs font-medium ${
                            msg.status === "received"
                              ? "text-green-500"
                              : "text-blue-400"
                          }`}
                        >
                          {msg.status === "received" ? "Received" : "Sent"}
                        </span>
                      </div>
                      <div>{msg.body}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                        {msg.receivedAt || "—"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
};

export default SMSPage;

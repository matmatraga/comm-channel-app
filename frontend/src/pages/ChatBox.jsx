import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import { Paperclip, Send, User2 } from "lucide-react";

const socket = io("https://omni-channel-app.onrender.com", {
  auth: { token: localStorage.getItem("token") || "" },
});

const ChatBox = () => {
  const { theme } = useTheme();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedReceiver, setSelectedReceiver] = useState(null);
  const messageContainerRef = useRef();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: user } = await axios.get(
          "https://omni-channel-app.onrender.com/api/users/currentUser",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCurrentUser(user);

        const { data: userList } = await axios.get(
          "https://omni-channel-app.onrender.com/api/users/details",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setUsers(userList);
      } catch (error) {
        console.error("❌ Error fetching user data:", error);
      }
    };

    fetchUserData();

    socket.on("private_message", (data) => {
      console.log(data);
      const incoming = {
        from: data.from,
        content: data.content,
        file: data.file,
        timestamp: new Date(data.timestamp || Date.now()).toLocaleString(),
      };
      setMessages((prev) => [...prev, incoming]);
    });

    return () => socket.off("private_message");
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      console.log("📡 Fetching history for:", selectedReceiver?._id);
      if (!selectedReceiver?._id) return;

      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
          `https://omni-channel-app.onrender.com/api/chat/history/${selectedReceiver._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("✅ Chat history fetched:", data);

        const formatted = data.chats.map((msg) => ({
          from: msg.sender,
          content: msg.message,
          file: msg.file,
          timestamp: new Date(msg.createdAt).toLocaleString(),
        }));

        setMessages(formatted);
      } catch (err) {
        console.error("❌ Failed to fetch chat history:", err);
      }
    };

    fetchHistory();
  }, [selectedReceiver]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "https://omni-channel-app.onrender.com/api/chat/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return res.data.filename;
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!currentUser._id || !selectedReceiver?._id) return;

    let uploadedFilename = null;
    if (file) {
      uploadedFilename = await handleFileUpload(file);
    }

    const content = {
      message,
      file: uploadedFilename || null,
    };

    socket.emit("private_message", {
      to: selectedReceiver._id,
      content,
    });

    setMessage("");
    setFile(null);
  };

  return (
    <main
      className={`min-h-screen flex items-center justify-center px-4 py-6 transition-colors duration-300 
      ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-blue-50 text-gray-900"
      }`}
    >
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Select Recipient
          </label>
          <select
            className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            value={selectedReceiver?._id || ""}
            onChange={(e) => {
              const user = users.find((u) => u._id === e.target.value);
              setSelectedReceiver(user);
            }}
          >
            <option value="" disabled>
              Select a user
            </option>
            {users
              .filter((user) => user._id !== currentUser._id)
              .map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name}
                </option>
              ))}
          </select>
        </div>

        <div
          ref={messageContainerRef}
          className="h-80 overflow-y-auto space-y-4 bg-gray-100 dark:bg-gray-700 p-4 rounded-lg"
        >
          {messages.map((msg, i) => {
            const isSender = msg.from?._id === currentUser._id;

            return (
              <div
                key={i}
                className={`flex flex-col ${
                  isSender ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[70%] px-4 py-2 rounded-lg shadow
          ${
            isSender
              ? theme === "dark"
                ? "bg-blue-700 text-white"
                : "bg-blue-100 text-blue-900"
              : theme === "dark"
              ? "bg-gray-600 text-gray-100"
              : "bg-gray-200 text-gray-900"
          }`}
                >
                  <div className="text-sm font-semibold mb-1 flex items-center gap-1">
                    <User2 className="h-4 w-4" />
                    {msg.from?.name || "User"}
                  </div>
                  <div className="text-sm">{msg.content}</div>

                  {msg.file && (
                    <div className="flex items-center gap-2 mt-2 bg-gray-100 dark:bg-gray-600 p-2 rounded-md max-w-full">
                      {/\.(jpg|jpeg|png|gif|webp|svg)$/i.test(msg.file) && (
                        <img
                          src={`https://omni-channel-app.onrender.com/api/chat/download/${msg.file}`}
                          alt="attachment"
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <a
                        href={`https://omni-channel-app.onrender.com/api/chat/download/${msg.file}`}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 dark:text-blue-300 underline break-all truncate max-w-full"
                      >
                        {msg.file}
                      </a>
                    </div>
                  )}
                  <div className="text-xs mt-1 text-gray-300">
                    {msg.timestamp}
                  </div>
                </div>

                {/* Read receipt (only show on sender's messages) */}
                {isSender && (
                  <div className="text-xs text-gray-400 mt-1 pr-1">
                    {msg.isRead ? "Seen" : "Delivered"}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message"
            className="flex-1 p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"
            required
          />
          <div className="flex items-center gap-2 flex-wrap">
            <label className="cursor-pointer flex items-center gap-1">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
              />
              <Paperclip className="h-5 w-5 text-gray-500 hover:text-blue-600" />
            </label>

            {file && (
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs max-w-[200px] overflow-x-auto">
                <span className="whitespace-nowrap truncate text-gray-700 dark:text-gray-200">
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="text-red-500 font-bold hover:text-red-700"
                  title="Remove file"
                >
                  ×
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-1 hover:bg-blue-700 transition"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </form>
      </div>
    </main>
  );
};

export default ChatBox;

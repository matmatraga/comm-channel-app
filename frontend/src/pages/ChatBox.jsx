import { useState, useEffect, useRef, useCallback } from "react";
import api from "../lib/api";
import { useTheme } from "../context/ThemeContext";
import { useSocket } from "../context/SocketContext";
import { useCall } from "../hooks/useCall";
import ConversationList from "../components/chat/ConversationList";
import ChatThread from "../components/chat/ChatThread";

const ChatBox = () => {
  const { theme } = useTheme();
  const { socket, onlineUsers, isOnline } = useSocket();
  const {
    startCall,
  } = useCall();

  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const messageContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get("/api/chat/conversations");
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoadingConversations(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const [userRes, usersRes] = await Promise.all([
          api.get("/api/users/currentUser"),
          api.get("/api/users/details"),
        ]);
        setCurrentUser(userRes.data);
        setUsers(usersRes.data);
        await fetchConversations();
      } catch (err) {
        console.error("Init error:", err);
      }
    };
    init();
  }, [fetchConversations]);

  useEffect(() => {
    if (!socket) return;

    const onMessage = (data) => {
      const incoming = {
        _id: data._id,
        from: data.from,
        content: data.content,
        file: data.file,
        timestamp: data.timestamp || new Date(),
        isRead: data.isRead,
        status: "delivered",
      };

      if (
        selectedPartner &&
        data.from?._id === selectedPartner._id
      ) {
        setMessages((prev) => [...prev, incoming]);
        const unreadIds = [data._id];
        socket.emit("message_read", {
          messageIds: unreadIds,
          partnerId: selectedPartner._id,
        });
      }
      fetchConversations();
    };

    const onMessageSent = (data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.tempId
            ? {
                ...m,
                _id: data._id,
                content: data.content,
                file: data.file,
                status: "delivered",
                timestamp: data.timestamp,
                tempId: undefined,
              }
            : m
        )
      );
      fetchConversations();
    };

    const onReadReceipt = ({ messageIds }) => {
      setMessages((prev) =>
        prev.map((m) =>
          messageIds.includes(m._id?.toString()) ? { ...m, isRead: true } : m
        )
      );
    };

    const onTypingStart = ({ from }) => {
      if (selectedPartner && from === selectedPartner._id) {
        setIsTyping(true);
      }
    };

    const onTypingStop = ({ from }) => {
      if (selectedPartner && from === selectedPartner._id) {
        setIsTyping(false);
      }
    };

    socket.on("private_message", onMessage);
    socket.on("message_sent", onMessageSent);
    socket.on("read_receipt", onReadReceipt);
    socket.on("typing_start", onTypingStart);
    socket.on("typing_stop", onTypingStop);

    return () => {
      socket.off("private_message", onMessage);
      socket.off("message_sent", onMessageSent);
      socket.off("read_receipt", onReadReceipt);
      socket.off("typing_start", onTypingStart);
      socket.off("typing_stop", onTypingStop);
    };
  }, [socket, selectedPartner, fetchConversations]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedPartner?._id) {
        setMessages([]);
        return;
      }
      setLoadingMessages(true);
      try {
        const { data } = await api.get(
          `/api/chat/history/${selectedPartner._id}`
        );
        const formatted = data.chats.map((msg) => ({
          _id: msg._id,
          from: msg.sender,
          content: msg.message,
          file: msg.file,
          timestamp: msg.createdAt,
          isRead: msg.isRead,
          status: "delivered",
        }));
        setMessages(formatted);

        const unreadIds = formatted
          .filter((m) => !m.isRead && m.from?._id === selectedPartner._id)
          .map((m) => m._id);
        if (unreadIds.length && socket) {
          socket.emit("message_read", {
            messageIds: unreadIds,
            partnerId: selectedPartner._id,
          });
        }
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setLoadingMessages(false);
      }
    };
    loadHistory();
  }, [selectedPartner, socket]);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (message, file) => {
    if (!currentUser?._id || !selectedPartner?._id) return;

    let uploadedFilename = null;
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/api/chat/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      uploadedFilename = res.data.filename;
    }

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      tempId,
      from: currentUser,
      content: message,
      file: uploadedFilename,
      timestamp: new Date(),
      status: "sending",
    };
    setMessages((prev) => [...prev, optimistic]);

    socket.emit("private_message", {
      to: selectedPartner._id,
      content: { message, file: uploadedFilename },
    });
  };

  const handleTypingStart = () => {
    if (!selectedPartner || !socket) return;
    socket.emit("typing_start", { to: selectedPartner._id });
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing_stop", { to: selectedPartner._id });
    }, 2000);
  };

  const handleTypingStop = () => {
    if (!selectedPartner || !socket) return;
    clearTimeout(typingTimeoutRef.current);
    socket.emit("typing_stop", { to: selectedPartner._id });
  };

  const handleSelectPartner = (partner) => {
    setSelectedPartner(partner);
    setMobileShowThread(true);
  };

  const handleStartCall = async (type) => {
    if (!selectedPartner) return;
    try {
      await startCall(selectedPartner._id, type);
    } catch {
      // toast handled in hook
    }
  };

  return (
    <main
      className={`min-h-[calc(100vh-4rem)] transition-colors duration-300 ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)]">
        <div className="flex h-full bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
          <div
            className={`w-full md:w-80 lg:w-96 border-r dark:border-gray-700 flex-shrink-0 ${
              mobileShowThread ? "hidden md:flex md:flex-col" : "flex flex-col"
            }`}
          >
            <ConversationList
              conversations={conversations}
              users={users}
              currentUser={currentUser}
              selectedPartner={selectedPartner}
              onlineUsers={onlineUsers}
              onSelectPartner={handleSelectPartner}
              loading={loadingConversations}
            />
          </div>

          <div
            className={`flex-1 flex flex-col ${
              mobileShowThread ? "flex" : "hidden md:flex"
            }`}
          >
            <ChatThread
              partner={selectedPartner}
              messages={messages}
              currentUser={currentUser}
              isOnline={selectedPartner ? isOnline(selectedPartner._id) : false}
              isTyping={isTyping}
              loading={loadingMessages}
              onSend={handleSend}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
              onBack={() => setMobileShowThread(false)}
              onStartCall={handleStartCall}
              messageContainerRef={messageContainerRef}
              showBack
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default ChatBox;

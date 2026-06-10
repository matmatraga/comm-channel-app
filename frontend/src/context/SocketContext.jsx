import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import io from "socket.io-client";
import { getSocketUrl } from "../lib/api";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      const existing = socketRef.current;
      if (existing) {
        existing.removeAllListeners();
        existing.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io(getSocketUrl(), {
      auth: { token },
      transports: ["polling", "websocket"],
      reconnection: true,
    });

    const onPresence = ({ onlineUsers: online }) => {
      setOnlineUsers(online || []);
    };
    const onCallInvite = (data) => setIncomingCall(data);
    const onCallEnded = () => setIncomingCall(null);
    const onCallDeclined = () => setIncomingCall(null);
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    newSocket.on("presence_update", onPresence);
    newSocket.on("call_invite", onCallInvite);
    newSocket.on("call_ended", onCallEnded);
    newSocket.on("call_declined", onCallDeclined);
    newSocket.on("connect", onConnect);
    newSocket.on("disconnect", onDisconnect);

    socketRef.current = newSocket;
    setSocket(newSocket);
    setIsConnected(newSocket.connected);

    return () => {
      newSocket.off("presence_update", onPresence);
      newSocket.off("call_invite", onCallInvite);
      newSocket.off("call_ended", onCallEnded);
      newSocket.off("call_declined", onCallDeclined);
      newSocket.off("connect", onConnect);
      newSocket.off("disconnect", onDisconnect);
      newSocket.io.opts.reconnection = false;
      if (newSocket.connected) {
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated]);

  const clearIncomingCall = useCallback(() => setIncomingCall(null), []);

  const isOnline = useCallback(
    (userId) => onlineUsers.includes(userId?.toString()),
    [onlineUsers]
  );

  return (
    <SocketContext.Provider
      value={{ socket, onlineUsers, isOnline, incomingCall, clearIncomingCall, isConnected }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};

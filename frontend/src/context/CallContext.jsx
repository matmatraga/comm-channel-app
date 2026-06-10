import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import { useSocket } from "./SocketContext";

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const { socket } = useSocket();
  const [activeCall, setActiveCall] = useState(null);

  const startCall = useCallback(async (partnerId, type) => {
    try {
      const { data } = await api.post("/api/calls/start", {
        partnerId,
        type,
      });
      setActiveCall({
        callId: String(data.callId),
        type: data.type,
        displayName: data.displayName,
        partnerId: String(data.partnerId || partnerId),
        role: "caller",
        status: "ringing",
      });
      return data;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to start call");
      throw err;
    }
  }, []);

  const acceptCall = useCallback(async (callId, partnerId) => {
    try {
      const { data } = await api.post("/api/calls/accept", { callId });
      setActiveCall({
        callId: String(data.callId),
        type: data.type,
        displayName: data.displayName,
        partnerId: String(data.partnerId || partnerId),
        role: "callee",
        status: "connected",
      });
      return data;
    } catch (err) {
      toast.error("Failed to accept call");
      throw err;
    }
  }, []);

  const declineCall = useCallback(
    async (callId) => {
      try {
        await api.post("/api/calls/decline", { callId });
        socket?.emit("call_decline", { callId });
      } catch (err) {
        console.error(err);
      }
    },
    [socket]
  );

  const endCall = useCallback(
    async (callId) => {
      setActiveCall(null);
      try {
        await api.post("/api/calls/end", { callId });
        socket?.emit("call_end", { callId });
      } catch (err) {
        console.error(err);
      }
    },
    [socket]
  );

  const markCallConnected = useCallback(() => {
    setActiveCall((prev) =>
      prev ? { ...prev, status: "connected" } : prev
    );
  }, []);

  const clearActiveCall = useCallback(() => setActiveCall(null), []);

  useEffect(() => {
    if (!socket) return;

    const onDeclined = () => clearActiveCall();
    const onEnded = () => clearActiveCall();

    socket.on("call_declined", onDeclined);
    socket.on("call_ended", onEnded);

    return () => {
      socket.off("call_declined", onDeclined);
      socket.off("call_ended", onEnded);
    };
  }, [socket, clearActiveCall]);

  return (
    <CallContext.Provider
      value={{
        activeCall,
        startCall,
        acceptCall,
        declineCall,
        endCall,
        markCallConnected,
        clearActiveCall,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used within CallProvider");
  return ctx;
};

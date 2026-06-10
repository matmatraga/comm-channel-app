import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import { useCall } from "../../context/CallContext";
import { useRingtone } from "../../hooks/useRingtone";
import IncomingCallModal from "./IncomingCallModal";
import CallOverlay from "./CallOverlay";

const CallManager = () => {
  const { isAuthenticated } = useAuth();
  const { socket, incomingCall, clearIncomingCall } = useSocket();
  const {
    activeCall,
    acceptCall,
    declineCall,
    endCall,
    markCallConnected,
  } = useCall();
  const navigate = useNavigate();
  const location = useLocation();

  const shouldRing =
    !!incomingCall ||
    (activeCall?.role === "caller" && activeCall?.status === "ringing");
  useRingtone(shouldRing);

  if (!isAuthenticated) return null;

  const handleAcceptIncoming = async () => {
    if (!incomingCall) return;
    try {
      await acceptCall(
        String(incomingCall.callId),
        String(incomingCall.caller._id)
      );
      clearIncomingCall();
      if (location.pathname !== "/chat") {
        navigate("/chat");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineIncoming = async () => {
    if (!incomingCall) return;
    await declineCall(incomingCall.callId);
    clearIncomingCall();
  };

  return (
    <>
      <IncomingCallModal
        call={incomingCall}
        onAccept={handleAcceptIncoming}
        onDecline={handleDeclineIncoming}
      />

      {activeCall && (
        <CallOverlay
          activeCall={activeCall}
          socket={socket}
          onEnd={endCall}
          onConnected={markCallConnected}
        />
      )}
    </>
  );
};

export default CallManager;

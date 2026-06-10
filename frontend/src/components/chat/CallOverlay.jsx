import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const isAbortError = (err) => {
  const msg = String(err?.message || err || "");
  return msg.includes("Close called") || msg.includes("User-Initiated Abort");
};

const CallOverlay = ({ activeCall, socket, onEnd, onConnected }) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const streamRef = useRef(null);
  const cancelledRef = useRef(false);
  const pendingSignalsRef = useRef([]);

  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(activeCall?.type === "audio");
  const [status, setStatus] = useState(
    activeCall?.role === "caller" ? "ringing" : "connecting"
  );
  const [error, setError] = useState(null);

  const isVideo = activeCall?.type === "video";
  const canConnect =
    activeCall?.role === "callee" || activeCall?.status === "connected";

  useEffect(() => {
    setStatus(activeCall?.role === "caller" ? "ringing" : "connecting");
    setError(null);
    setMuted(false);
    setVideoOff(activeCall?.type === "audio");
  }, [activeCall?.callId, activeCall?.role, activeCall?.type]);

  useEffect(() => {
    if (!socket || !activeCall) return;

    const callId = String(activeCall.callId);

    const onAccepted = ({ callId: acceptedId }) => {
      if (String(acceptedId) === callId && activeCall.role === "caller") {
        setStatus("connecting");
        onConnected?.();
      }
    };

    socket.on("call_accepted", onAccepted);
    return () => socket.off("call_accepted", onAccepted);
  }, [socket, activeCall?.callId, activeCall?.role, onConnected]);

  useEffect(() => {
    if (!socket || !activeCall || !canConnect) return;

    cancelledRef.current = false;
    pendingSignalsRef.current = [];

    const callId = String(activeCall.callId);
    const partnerId = String(activeCall.partnerId);
    const isInitiator = activeCall.role === "caller";

    const stopStream = () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    };

    const destroyPeer = () => {
      const peer = peerRef.current;
      if (!peer) return;
      peer.removeAllListeners();
      try {
        peer.destroy();
      } catch {
        // ignore teardown errors
      }
      peerRef.current = null;
    };

    const applySignal = (signal) => {
      const peer = peerRef.current;
      if (peer && !peer.destroyed) {
        peer.signal(signal);
        return true;
      }
      pendingSignalsRef.current.push(signal);
      return false;
    };

    const flushPendingSignals = () => {
      const peer = peerRef.current;
      if (!peer || peer.destroyed) return;
      const queued = pendingSignalsRef.current.splice(0);
      queued.forEach((signal) => {
        try {
          peer.signal(signal);
        } catch (err) {
          if (!isAbortError(err)) console.error("Queued signal error:", err);
        }
      });
    };

    const onSignal = ({ callId: signalCallId, signal }) => {
      if (cancelledRef.current || String(signalCallId) !== callId) return;
      applySignal(signal);
    };

    socket.on("call_signal", onSignal);

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: isVideo,
        });

        if (cancelledRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const peer = new Peer({
          initiator: isInitiator,
          trickle: true,
          stream,
          config: { iceServers: ICE_SERVERS },
        });

        peerRef.current = peer;
        flushPendingSignals();

        peer.on("signal", (signal) => {
          if (cancelledRef.current) return;
          socket.emit("call_signal", { to: partnerId, callId, signal });
        });

        peer.on("stream", (remoteStream) => {
          if (cancelledRef.current) return;
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
          setStatus("connected");
        });

        peer.on("connect", () => {
          if (!cancelledRef.current) setStatus("connected");
        });

        peer.on("error", (err) => {
          if (cancelledRef.current || isAbortError(err)) return;
          console.error("Peer error:", err);
          setError("Connection failed");
        });
      } catch (err) {
        if (!cancelledRef.current) {
          console.error("getUserMedia error:", err);
          setError("Could not access camera or microphone");
        }
      }
    };

    start();

    return () => {
      cancelledRef.current = true;
      pendingSignalsRef.current = [];
      socket.off("call_signal", onSignal);
      destroyPeer();
      stopStream();
    };
  }, [
    socket,
    activeCall?.callId,
    activeCall?.role,
    activeCall?.partnerId,
    activeCall?.status,
    canConnect,
    isVideo,
  ]);

  const toggleMute = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];
    if (!audioTrack) return;
    audioTrack.enabled = !audioTrack.enabled;
    setMuted(!audioTrack.enabled);
  };

  const toggleVideo = () => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];
    if (!videoTrack) return;
    videoTrack.enabled = !videoTrack.enabled;
    setVideoOff(!videoTrack.enabled);
  };

  if (!activeCall) return null;

  const statusLabel =
    status === "ringing"
      ? "Ringing…"
      : status === "connecting"
      ? "Connecting…"
      : status === "connected"
      ? "Connected"
      : "";

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-gray-900">
      <div className="flex-1 relative min-h-0">
        {isVideo ? (
          <>
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover bg-black"
            />
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="absolute bottom-4 right-4 w-40 h-28 rounded-lg object-cover border-2 border-white/30 shadow-lg"
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-white gap-4">
            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-semibold">
              {(activeCall.displayName || "U")[0].toUpperCase()}
            </div>
            <p className="text-lg">{activeCall.displayName || "Call"}</p>
            <p className="text-sm text-gray-400">{statusLabel}</p>
            <audio ref={remoteVideoRef} autoPlay playsInline className="hidden" />
          </div>
        )}

        {!isVideo && (
          <audio ref={localVideoRef} autoPlay playsInline muted className="hidden" />
        )}

        {(status !== "connected" || error) && isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
            <p className="text-white text-sm">{error || statusLabel}</p>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-2 py-6 bg-gray-900/90">
        {isVideo && statusLabel && status !== "connected" && !error && (
          <p className="text-sm text-gray-400">{statusLabel}</p>
        )}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-center gap-4">
          <button
            type="button"
            onClick={toggleMute}
            className={`p-4 rounded-full ${muted ? "bg-red-500" : "bg-gray-700"} text-white`}
          >
            {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </button>
          {isVideo && (
            <button
              type="button"
              onClick={toggleVideo}
              className={`p-4 rounded-full ${videoOff ? "bg-red-500" : "bg-gray-700"} text-white`}
            >
              {videoOff ? (
                <VideoOff className="h-6 w-6" />
              ) : (
                <Video className="h-6 w-6" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => onEnd(String(activeCall.callId))}
            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallOverlay;

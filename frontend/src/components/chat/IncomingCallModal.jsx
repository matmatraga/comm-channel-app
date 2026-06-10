import { Phone, PhoneOff, Video } from "lucide-react";

const IncomingCallModal = ({ call, onAccept, onDecline }) => {
  if (!call) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse ring-4 ring-blue-400/40">
          {call.type === "video" ? (
            <Video className="h-10 w-10 text-white" />
          ) : (
            <Phone className="h-10 w-10 text-white" />
          )}
        </div>
        <h3 className="text-xl font-bold mb-1">
          Incoming {call.type === "video" ? "Video" : "Audio"} Call
        </h3>
        <p className="text-gray-500 mb-6">{call.caller?.name || "Someone"}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onDecline}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-full font-medium"
          >
            <PhoneOff className="h-5 w-5" />
            Decline
          </button>
          <button
            onClick={onAccept}
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-medium"
          >
            <Phone className="h-5 w-5" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;

import { ArrowLeft, Phone, Video } from "lucide-react";
import { getInitials } from "../../lib/chatUtils";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatComposer from "./ChatComposer";
import { formatMessageDate } from "../../lib/chatUtils";

const ChatThread = ({
  partner,
  messages,
  currentUser,
  isOnline,
  isTyping,
  loading,
  onSend,
  onTypingStart,
  onTypingStop,
  onBack,
  onStartCall,
  messageContainerRef,
  showBack,
}) => {
  if (!partner) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-lg font-medium">Select a conversation</p>
          <p className="text-sm mt-1">Choose someone to start chatting</p>
        </div>
      </div>
    );
  }

  const grouped = [];
  let lastDate = null;

  messages.forEach((msg) => {
    const dateLabel = formatMessageDate(msg.timestamp);
    if (dateLabel !== lastDate) {
      grouped.push({ type: "date", label: dateLabel });
      lastDate = dateLabel;
    }
    grouped.push({ type: "message", data: msg });
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b dark:border-gray-700 bg-white dark:bg-gray-800">
        {showBack && (
          <button onClick={onBack} className="md:hidden p-1">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
            {getInitials(partner.name)}
          </div>
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-sm">{partner.name}</p>
          <p className="text-xs text-gray-500">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onStartCall("audio")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-green-600"
            title="Audio call"
          >
            <Phone className="h-5 w-5" />
          </button>
          <button
            onClick={() => onStartCall("video")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600"
            title="Video call"
          >
            <Video className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900"
      >
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-10 bg-gray-200 dark:bg-gray-700 rounded-2xl ${i % 2 ? "ml-auto w-1/2" : "w-1/2"}`}
              />
            ))}
          </div>
        ) : grouped.length === 0 ? (
          <p className="text-center text-sm text-gray-400 mt-8">
            No messages yet. Say hello!
          </p>
        ) : (
          grouped.map((item, i) =>
            item.type === "date" ? (
              <div key={`date-${i}`} className="flex justify-center">
                <span className="text-xs text-gray-400 bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full">
                  {item.label}
                </span>
              </div>
            ) : (
              <MessageBubble
                key={item.data._id || item.data.tempId || i}
                msg={item.data}
                isSender={item.data.from?._id === currentUser?._id}
              />
            )
          )
        )}
        {isTyping && <TypingIndicator name={partner.name} />}
      </div>

      <ChatComposer
        onSend={onSend}
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
      />
    </div>
  );
};

export default ChatThread;

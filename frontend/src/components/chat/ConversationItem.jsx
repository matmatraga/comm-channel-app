import { getInitials } from "../../lib/chatUtils";

const ConversationItem = ({
  partner,
  lastMessage,
  lastMessageAt,
  unreadCount,
  isOnline,
  isActive,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-left ${
      isActive ? "bg-blue-50 dark:bg-gray-700 border-l-4 border-blue-600" : ""
    }`}
  >
    <div className="relative flex-shrink-0">
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
        {getInitials(partner?.name)}
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-baseline">
        <span className="font-semibold text-sm truncate">{partner?.name}</span>
        {lastMessageAt && (
          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
            {new Date(lastMessageAt).toLocaleTimeString(undefined, {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {lastMessage || "No messages yet"}
        </p>
        {unreadCount > 0 && (
          <span className="ml-2 flex-shrink-0 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  </button>
);

export default ConversationItem;

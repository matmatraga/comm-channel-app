import { formatTime, isImageAttachment } from "../../lib/chatUtils";
import AuthenticatedAttachment from "./AuthenticatedAttachment";

const MessageBubble = ({ msg, isSender }) => {
  const hasCaption = !!msg.content?.trim();
  const isImage = msg.file && isImageAttachment(msg.file);
  const isImageOnly = isImage && !hasCaption;

  return (
    <div className={`flex flex-col ${isSender ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl shadow-sm overflow-hidden ${
          isImageOnly ? "p-0" : "px-4 py-2"
        } ${
          isSender
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm"
        }`}
      >
        {hasCaption && (
          <div className="text-sm whitespace-pre-wrap break-words">
            {msg.content}
          </div>
        )}
        {msg.file && (
          <div
            className={
              hasCaption && isImage
                ? "mt-2 -mx-4"
                : hasCaption
                ? "mt-2"
                : ""
            }
          >
            <AuthenticatedAttachment
              filename={msg.file}
              isSender={isSender}
              fullBleed={!!isImage}
              timestamp={isImageOnly ? formatTime(msg.timestamp) : undefined}
            />
          </div>
        )}
        {!isImageOnly && (
          <div
            className={`text-xs mt-1 ${
              isSender ? "text-blue-200" : "text-gray-400"
            }`}
          >
            {formatTime(msg.timestamp)}
          </div>
        )}
      </div>
      {isSender && (
        <div className="text-xs text-gray-400 mt-0.5 mr-1">
          {msg.status === "sending"
            ? "Sending..."
            : msg.isRead
            ? "Seen"
            : msg.status === "delivered" || msg._id
            ? "Delivered"
            : ""}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;

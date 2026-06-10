import { useState } from "react";
import { Paperclip, Send } from "lucide-react";

const ChatComposer = ({ onSend, onTypingStart, onTypingStop, disabled }) => {
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !file) return;
    setSending(true);
    onTypingStop?.();
    await onSend(message, file);
    setMessage("");
    setFile(null);
    setSending(false);
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    if (e.target.value) onTypingStart?.();
    else onTypingStop?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 p-3 border-t dark:border-gray-700 bg-white dark:bg-gray-800"
    >
      <label className="cursor-pointer flex-shrink-0">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="hidden"
          disabled={disabled}
        />
        <Paperclip className="h-5 w-5 text-gray-500 hover:text-blue-600" />
      </label>
      {file && (
        <span className="text-xs text-gray-500 truncate max-w-[100px]">
          {file.name}
          <button
            type="button"
            onClick={() => setFile(null)}
            className="ml-1 text-red-500"
          >
            ×
          </button>
        </span>
      )}
      <input
        type="text"
        value={message}
        onChange={handleChange}
        onBlur={onTypingStop}
        placeholder="Type a message..."
        disabled={disabled || sending}
        className="flex-1 px-3 py-2 rounded-full border dark:bg-gray-700 dark:border-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={disabled || sending || (!message.trim() && !file)}
        className="flex-shrink-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
      >
        <Send className="h-4 w-4" />
      </button>
    </form>
  );
};

export default ChatComposer;

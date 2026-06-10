import { RefreshCw } from "lucide-react";
import {
  parseSender,
  formatEmailDate,
  emailSnippet,
  getInitials,
} from "../../lib/emailUtils";

const EmailInboxList = ({
  emails,
  selectedIndex,
  onSelect,
  onRefresh,
  loading,
}) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Inbox</h2>
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        title="Refresh inbox"
        className="p-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 transition"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      </button>
    </div>

    <div className="flex-1 overflow-y-auto">
      {loading && emails.length === 0 ? (
        <div className="p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-lg bg-gray-100 dark:bg-gray-700 animate-pulse"
            />
          ))}
        </div>
      ) : emails.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 py-12 px-4">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-sm">No recent emails</p>
        </div>
      ) : (
        emails.map((email, index) => {
          const { name } = parseSender(email.from);
          const selected = selectedIndex === index;

          return (
            <button
              key={email.messageId || index}
              type="button"
              onClick={() => onSelect(index)}
              className={`w-full text-left px-4 py-3 border-b dark:border-gray-700 transition ${
                selected
                  ? "bg-blue-50 dark:bg-blue-900/30 border-l-2 border-l-blue-600"
                  : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-l-transparent"
              }`}
            >
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 flex items-center justify-center text-xs font-semibold">
                  {getInitials(name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <span className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">
                      {name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                      {formatEmailDate(email.date)}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate text-gray-800 dark:text-gray-200">
                    {email.subject || "(No subject)"}
                    {email.attachments?.length > 0 && " 📎"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    {emailSnippet(email)}
                  </p>
                </div>
              </div>
            </button>
          );
        })
      )}
    </div>
  </div>
);

export default EmailInboxList;

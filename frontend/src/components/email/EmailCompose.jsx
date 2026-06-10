import { Send, Paperclip } from "lucide-react";

const EmailCompose = ({
  formData,
  files,
  sending,
  onChange,
  onFileChange,
  onSubmit,
}) => (
  <div className="flex flex-col h-full min-h-0">
    <h2 className="text-lg font-semibold px-4 py-3 border-b dark:border-gray-700 text-gray-900 dark:text-white">
      Compose
    </h2>
    <form
      onSubmit={onSubmit}
      className="flex flex-col flex-1 min-h-0 p-4 gap-3 overflow-y-auto"
    >
      <div className="flex-shrink-0">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          To
        </label>
        <input
          type="email"
          name="to"
          value={formData.to}
          onChange={onChange}
          required
          placeholder="recipient@example.com"
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex-shrink-0">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Subject
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={onChange}
          required
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex-shrink-0">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
          Message
        </label>
        <textarea
          name="text"
          value={formData.text}
          onChange={onChange}
          required
          rows={6}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[120px] max-h-48"
        />
      </div>
      <div className="flex-shrink-0 pt-1 border-t border-gray-200 dark:border-gray-700">
        <label className="inline-flex items-center gap-2 cursor-pointer text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
          <Paperclip className="h-4 w-4 flex-shrink-0" />
          <span>{files?.length ? `${files.length} file(s)` : "Attach files"}</span>
          <input type="file" multiple onChange={onFileChange} className="hidden" />
        </label>
      </div>
      <button
        type="submit"
        disabled={sending}
        className="flex-shrink-0 flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg text-sm font-medium disabled:opacity-50 transition"
      >
        <Send className="h-4 w-4" />
        {sending ? "Sending…" : "Send"}
      </button>
    </form>
  </div>
);

export default EmailCompose;

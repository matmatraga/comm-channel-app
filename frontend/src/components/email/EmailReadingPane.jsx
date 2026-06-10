import api from "../../lib/api";
import {
  parseSender,
  formatEmailDateFull,
  renderEmailBody,
} from "../../lib/emailUtils";

const EmailReadingPane = ({ email }) => {
  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 px-6">
        <div className="text-4xl mb-3">✉️</div>
        <p className="text-sm">Select an email to read</p>
      </div>
    );
  }

  const { name, email: address } = parseSender(email.from);
  const body = renderEmailBody(email);
  const baseUrl = api.defaults.baseURL;

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b dark:border-gray-700">
        <h1 className="text-xl font-semibold break-words text-gray-900 dark:text-white">
          {email.subject || "(No subject)"}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 dark:text-gray-300">
          <span>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {name}
            </span>
            {address && address !== name && (
              <span className="ml-1 text-gray-500 dark:text-gray-400">
                &lt;{address}&gt;
              </span>
            )}
          </span>
          <span className="text-gray-400 dark:text-gray-500">·</span>
          <span className="text-gray-500 dark:text-gray-400">
            {formatEmailDateFull(email.date)}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {body.type === "html" ? (
          <div
            className="email-html-content rounded-lg bg-white text-gray-900 p-4 sm:p-6 border border-gray-200 dark:border-gray-600 shadow-sm text-sm leading-relaxed overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: body.content }}
          />
        ) : (
          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans text-gray-800 dark:text-gray-200">
            {body.content || "(No content)"}
          </pre>
        )}

        {email.attachments?.length > 0 && (
          <div className="mt-6 pt-4 border-t dark:border-gray-700">
            <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Attachments ({email.attachments.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {email.attachments.map((attachment, idx) => {
                const fileKey =
                  attachment.generatedName ||
                  attachment.filename ||
                  attachment.name;
                const href = `${baseUrl}/api/attachments/${encodeURIComponent(fileKey)}`;

                return (
                  <a
                    key={idx}
                    href={href}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    📎 {attachment.filename || `Attachment ${idx + 1}`}
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailReadingPane;

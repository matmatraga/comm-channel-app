import React, { useState } from "react";
import PropTypes from "prop-types";

const EmailAccordion = ({ emails }) => {
  const [expanded, setExpanded] = useState(null);

  const toggle = (index) => {
    setExpanded((prev) => (prev === index ? null : index));
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Unknown Date";
    }
  };

  const formatAttachments = (attachments) => {
    if (!attachments?.length) {
      return (
        <p className="text-sm text-gray-400 dark:text-gray-500">
          No attachments
        </p>
      );
    }

    return attachments.map((attachment, idx) => (
      <a
        key={idx}
        href={`https://omni-channel-app.onrender.com/api/attachments/${encodeURIComponent(
          attachment.generatedName || attachment.filename || attachment.name
        )}`}
        download
        className="inline-block bg-gray-100 dark:bg-gray-700 text-sm text-gray-800 dark:text-gray-200 px-3 py-1 rounded mr-2 mb-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
      >
        📎 {attachment.filename || `Attachment ${idx + 1}`}
      </a>
    ));
  };

  if (emails.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 py-10">
        <div className="text-4xl mb-2">📭</div>
        <p>No emails to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {emails.map((email, index) => {
        const isOpen = expanded === index;

        return (
          <div
            key={index}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => toggle(index)}
              className={`w-full text-left px-4 py-3 transition-colors duration-200 ${
                isOpen
                  ? "bg-blue-100 dark:bg-blue-900"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              <div className="flex justify-between items-start gap-2 flex-wrap">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {email.subject || "No Subject"}{" "}
                    {email.attachments?.length > 0 && "📎"}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {email.from || "Unknown Sender"}
                  </p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(email.date)}
                </p>
              </div>
            </button>

            {isOpen && (
              <div className="bg-white dark:bg-gray-900 px-6 py-6 border-t border-gray-200 dark:border-gray-700 space-y-4">
                {/* Email Header */}
                <div className="flex justify-between items-center flex-wrap">
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {email.subject || "No Subject"}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      From: {email.from || "Unknown Sender"}
                    </p>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(email.date)}
                  </span>
                </div>

                {/* Email Body */}
                <div
                  className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-gray-800 dark:text-gray-200"
                  dangerouslySetInnerHTML={{
                    __html: email.text || "<em>No content.</em>",
                  }}
                ></div>

                {/* Attachments */}
                {email.attachments?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">
                      Attachments:
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {formatAttachments(email.attachments)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

EmailAccordion.propTypes = {
  emails: PropTypes.arrayOf(
    PropTypes.shape({
      subject: PropTypes.string,
      from: PropTypes.string,
      text: PropTypes.string,
      date: PropTypes.string,
      attachments: PropTypes.arrayOf(
        PropTypes.shape({
          filename: PropTypes.string,
          name: PropTypes.string,
          generatedName: PropTypes.string,
        })
      ),
    })
  ).isRequired,
};

export default EmailAccordion;

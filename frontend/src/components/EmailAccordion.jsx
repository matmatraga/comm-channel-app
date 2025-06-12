import React from 'react';
import PropTypes from 'prop-types';

const EmailAccordion = ({ emails }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) {
      return <span className="text-muted">None</span>;
    }

    return attachments.map((attachment, idx) => (
      <a
        key={idx}
        href={`http://https://omni-channel-app.onrender.com//api/attachments/${encodeURIComponent(
          attachment.generatedName || attachment.filename || attachment.name
        )}`}
        className="btn btn-sm btn-outline-secondary me-2 mb-2"
        download
      >
        📎 {attachment.filename || attachment.name || `Attachment ${idx + 1}`}
      </a>
    ));
  };

  return (
    <div className="accordion" id="emailAccordion">
      {emails.map((email, index) => (
        <div className="accordion-item" key={index}>
          <h2 className="accordion-header" id={`heading-${index}`}>
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#collapse-${index}`}
              aria-expanded="false"
              aria-controls={`collapse-${index}`}
            >
              <div className="d-flex justify-content-between align-items-center w-100">
                <div>
                  <div className="fw-bold">
                    {email.subject || 'No Subject'}
                    {email.attachments?.length > 0 && (
                      <span className="ms-2">📎</span>
                    )}
                  </div>
                  <small className="text-muted">
                    {email.from || 'Unknown Sender'}
                  </small>
                </div>
                <small className="text-muted">{formatDate(email.date)}</small>
              </div>
            </button>
          </h2>

          <div
            id={`collapse-${index}`}
            className="accordion-collapse collapse"
            aria-labelledby={`heading-${index}`}
            data-bs-parent="#emailAccordion"
          >
            <div className="accordion-body">
              <div className="mb-3 border-start border-primary border-3 ps-3" style={{ whiteSpace: 'pre-wrap' }}>
                {email.text || 'No content.'}
              </div>

              {email.attachments?.length > 0 && (
                <div className="mt-3">
                  <strong className="text-primary">Attachments:</strong>
                  <div className="ms-2 mt-2">
                    {formatAttachments(email.attachments)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {emails.length === 0 && (
        <div className="accordion-item">
          <div className="accordion-body text-center text-muted">
            <i className="fas fa-inbox fa-2x mb-3"></i>
            <p>No emails to display</p>
          </div>
        </div>
      )}
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
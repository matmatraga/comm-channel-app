// SMSPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('http://https://omni-channel-app.onrender.com/', {
  auth: {token: localStorage.getItem('token') || ''}
});

const SMSPage = () => {
  const [inbox, setInbox] = useState({});
  const [to, setTo] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    // Listen for incoming SMS from backend via Socket.IO
    socket.on('incoming_sms', ({ from, body }) => {
      setInbox(prev => ({
        ...prev,
        [from]: [...(prev[from] || []), { from, body, received: true }]
      }));
    });

    return () => socket.off('incoming_sms');
  }, []);

  const sendSMS = async (e) => {
    e.preventDefault();
    if (!to || !body) return;

    try {
      await axios.post('http://https://omni-channel-app.onrender.com//api/sms/send', { to, message: body });
      setInbox(prev => ({
        ...prev,
        [to]: [...(prev[to] || []), { from: 'You', body, received: false }]
      }));
      setBody('');
    } catch (err) {
      console.error('[SEND SMS ERROR]', err);
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">📩 SMS Inbox</h3>

      <form onSubmit={sendSMS} className="mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label className="form-label">To</label>
            <input
              type="tel"
              className="form-control"
              placeholder="+639XXXXXXXXX"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">Message</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your message"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          <div className="col-md-2">
            <button className="btn btn-primary w-100">Send</button>
          </div>
        </div>
      </form>

      <div className="accordion" id="smsInboxAccordion">
        {Object.entries(inbox).map(([sender, messages], idx) => (
          <div className="accordion-item" key={sender}>
            <h2 className="accordion-header" id={`heading-${idx}`}>
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#collapse-${idx}`}
                aria-expanded="false"
                aria-controls={`collapse-${idx}`}
              >
                {sender}
              </button>
            </h2>
            <div
              id={`collapse-${idx}`}
              className="accordion-collapse collapse"
              aria-labelledby={`heading-${idx}`}
              data-bs-parent="#smsInboxAccordion"
            >
              <div className="accordion-body">
                {messages.map((msg, i) => (
                  <div key={i} className={`mb-2 ${msg.received ? 'text-start' : 'text-end'}`}>
                    <small className="text-muted">{msg.received ? sender : 'You'}</small>
                    <div>{msg.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SMSPage;
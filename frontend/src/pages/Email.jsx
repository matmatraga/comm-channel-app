import React, { useState, useEffect } from 'react';
import EmailAccordion from '../components/EmailAccordion';
import axios from 'axios';

const EmailForm = () => {
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    text: '',
  });
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [emails, setEmails] = useState([]);

  // 📩 Fetch received emails on mount
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://https://omni-channel-app.onrender.com//api/emails/receive', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setEmails(response.data.emails || []);
      } catch (error) {
        console.error('Error fetching emails:', error);
      }
    };

    fetchEmails();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    const data = new FormData();
    data.append('to', formData.to);
    data.append('subject', formData.subject);
    data.append('text', formData.text);
    for (let i = 0; i < files.length; i++) {
      data.append('attachments', files[i]); // must match multer field
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://https://omni-channel-app.onrender.com//api/emails/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();
      if (response.ok) {
        setStatus('Email sent successfully!');
      } else {
        setStatus(result.error || 'Failed to send email.');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setStatus('An error occurred.');
    }
  };

  return (
    <div className="container my-5">
      <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-xl mb-6">
        <h2 className="text-xl font-semibold mb-4">Send Email</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="to"
            placeholder="To"
            value={formData.to}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            name="text"
            placeholder="Message"
            value={formData.text}
            onChange={handleChange}
            className="w-full p-2 border rounded h-32"
            required
          />
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Send Email
          </button>
        </form>
        {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
      </div>

      {/* 📥 Inbox section */}
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold mb-3">Inbox</h3>
        <EmailAccordion emails={emails} />
      </div>
    </div>
  );
};

export default EmailForm;

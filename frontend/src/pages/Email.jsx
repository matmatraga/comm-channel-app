import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import EmailAccordion from "../components/EmailAccordion";

const Email = () => {
  const [formData, setFormData] = useState({
    to: "",
    subject: "",
    text: "",
  });
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "https://omni-channel-app.onrender.com/api/emails/receive",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setEmails(res.data.emails || []);
      } catch (err) {
        console.error("Error fetching emails:", err);
        toast.error("❌ Failed to fetch inbox");
      }
    };

    fetchEmails();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => setFiles(e.target.files);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    toast.loading("📤 Sending email...", { id: "email-send" });

    const data = new FormData();
    data.append("to", formData.to);
    data.append("subject", formData.subject);
    data.append("text", formData.text);
    for (let i = 0; i < files.length; i++) {
      data.append("attachments", files[i]);
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "https://omni-channel-app.onrender.com/api/emails/send",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("✅ Email sent successfully!", { id: "email-send" });
      setFormData({ to: "", subject: "", text: "" });
      setFiles([]);
    } catch (err) {
      console.error("Error sending email:", err);
      const msg = err.response?.data?.error || "Failed to send email.";
      toast.error(`❌ ${msg}`, { id: "email-send" });
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-screen py-10 px-4 bg-gradient-to-br from-blue-100 via-purple-100 to-white text-gray-900 dark:from-gray-900 dark:via-gray-800 dark:to-black dark:text-white transition-colors duration-300">
      <Toaster position="top-right" />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Email Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold mb-4">✉️ Send Email</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">To</label>
              <input
                type="email"
                name="to"
                placeholder="Enter recipient email"
                value={formData.to}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                placeholder="Enter subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <textarea
                name="text"
                placeholder="Type your message here"
                value={formData.text}
                onChange={handleChange}
                rows={5}
                required
                className="w-full px-3 py-2 rounded-lg border dark:border-gray-600 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Attachments
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 dark:text-gray-300"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
            >
              {sending ? "Sending..." : "Send Email"}
            </button>
          </form>
        </div>

        {/* Inbox Section */}
        <div>
          <h3 className="text-xl font-semibold mb-4">📥 Inbox</h3>
          <EmailAccordion emails={emails} />
        </div>
      </div>
    </main>
  );
};

export default Email;

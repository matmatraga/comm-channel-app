import { useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import toast from "react-hot-toast";
import EmailCompose from "../components/email/EmailCompose";
import EmailInboxList from "../components/email/EmailInboxList";
import EmailReadingPane from "../components/email/EmailReadingPane";

const Email = () => {
  const [formData, setFormData] = useState({ to: "", subject: "", text: "" });
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [emails, setEmails] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loadingInbox, setLoadingInbox] = useState(true);
  const [mobileView, setMobileView] = useState("inbox");

  const fetchEmails = useCallback(async () => {
    setLoadingInbox(true);
    try {
      const res = await api.get("/api/emails/receive");
      const list = res.data.emails || [];
      setEmails(list);
      setSelectedIndex((prev) =>
        prev !== null && prev < list.length ? prev : list.length ? 0 : null
      );
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to fetch inbox");
    } finally {
      setLoadingInbox(false);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
  }, [fetchEmails]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => setFiles(e.target.files);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    toast.loading("Sending email...", { id: "email-send" });

    const data = new FormData();
    data.append("to", formData.to);
    data.append("subject", formData.subject);
    data.append("text", formData.text);
    for (let i = 0; i < files.length; i++) {
      data.append("attachments", files[i]);
    }

    try {
      await api.post("/api/emails/send", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Email sent!", { id: "email-send" });
      setFormData({ to: "", subject: "", text: "" });
      setFiles([]);
      await fetchEmails();
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send email.", {
        id: "email-send",
      });
    } finally {
      setSending(false);
    }
  };

  const handleSelectEmail = (index) => {
    setSelectedIndex(index);
    setMobileView("read");
  };

  const selectedEmail =
    selectedIndex !== null ? emails[selectedIndex] : null;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] p-2 md:p-4">
        <div className="mb-2 md:mb-3 px-1">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Email (Demo)
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Shared demo inbox — not per-user mailboxes
          </p>
        </div>

        {/* Mobile tabs */}
        <div className="flex md:hidden gap-1 mb-2">
          {["compose", "inbox", "read"].map((view) => (
            <button
              key={view}
              type="button"
              onClick={() => setMobileView(view)}
              className={`flex-1 py-2 text-xs font-medium rounded-lg capitalize ${
                mobileView === view
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              }`}
            >
              {view}
            </button>
          ))}
        </div>

        <div className="flex h-[calc(100%-3.5rem)] md:h-[calc(100%-2.5rem)] bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border dark:border-gray-700">
          {/* Compose */}
          <aside
            className={`w-full md:w-72 lg:w-80 border-r dark:border-gray-700 flex-shrink-0 ${
              mobileView === "compose" ? "flex flex-col" : "hidden md:flex md:flex-col"
            }`}
          >
            <EmailCompose
              formData={formData}
              files={files}
              sending={sending}
              onChange={handleChange}
              onFileChange={handleFileChange}
              onSubmit={handleSubmit}
            />
          </aside>

          {/* Inbox list */}
          <aside
            className={`w-full md:w-72 lg:w-80 border-r dark:border-gray-700 flex-shrink-0 ${
              mobileView === "inbox" ? "flex flex-col" : "hidden md:flex md:flex-col"
            }`}
          >
            <EmailInboxList
              emails={emails}
              selectedIndex={selectedIndex}
              onSelect={handleSelectEmail}
              onRefresh={fetchEmails}
              loading={loadingInbox}
            />
          </aside>

          {/* Reading pane */}
          <section
            className={`flex-1 min-w-0 ${
              mobileView === "read" ? "flex flex-col" : "hidden md:flex md:flex-col"
            }`}
          >
            <EmailReadingPane email={selectedEmail} />
          </section>
        </div>
      </div>
    </main>
  );
};

export default Email;

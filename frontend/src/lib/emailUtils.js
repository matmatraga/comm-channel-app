import DOMPurify from "dompurify";

export const parseSender = (from = "") => {
  const match = from.match(/^"?([^"<]+)"?\s*<?([^>]*)>?$/);
  if (match) {
    return {
      name: match[1]?.trim() || from,
      email: match[2]?.trim() || from,
    };
  }
  return { name: from, email: from };
};

export const formatEmailDate = (dateString) => {
  try {
    const d = new Date(dateString);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) {
      return d.toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
    }
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

export const formatEmailDateFull = (dateString) => {
  try {
    return new Date(dateString).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "Unknown date";
  }
};

export const emailSnippet = (email) => {
  const text = email?.text?.replace(/\s+/g, " ").trim();
  if (text) return text.slice(0, 100);
  return "(No preview)";
};

export const sanitizeEmailHtml = (html) => {
  if (!html) return "";
  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
};

export const renderEmailBody = (email) => {
  if (email?.html) {
    return { type: "html", content: sanitizeEmailHtml(email.html) };
  }
  if (email?.text) {
    return { type: "text", content: email.text };
  }
  return { type: "text", content: "" };
};

export const getInitials = (name = "?") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

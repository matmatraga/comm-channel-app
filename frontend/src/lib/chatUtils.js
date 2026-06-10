export const getInitials = (name = "U") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export const formatMessageDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined,
  });
};

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

const IMAGE_EXT = /\.(jpg|jpeg|png|gif|webp|svg)$/i;

export const isImageAttachment = (filename) =>
  !!filename && IMAGE_EXT.test(filename);

export const attachmentDisplayName = (filename) =>
  filename?.replace(/^\d+-/, "") || filename || "attachment";

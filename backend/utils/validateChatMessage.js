/**
 * Validates that a chat message has text content or a file attachment.
 * Mirrors the Mongoose validator on the Chat model.
 */
const validateChatMessage = ({ message, file }) => {
  const text = typeof message === "string" ? message.trim() : "";
  return text.length > 0 || !!file;
};

module.exports = { validateChatMessage };

const { sendEmail } = require('../services/emailService');
const { getEmails } = require('../services/emailService');

exports.sendEmailHandler = async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    const attachments = req.files?.map(file => ({
      filename: file.originalname,
      path: file.path,
    }));

    await sendEmail({
      to,
      subject,
      text,
      attachments,
    });

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

exports.receiveEmailsHandler = async (req, res) => {
  try {
    const emails = await getEmails();
    res.status(200).json({ emails });
  } catch (error) {
    console.error("Email receiving error:", error);
    const isAuthFail =
      error.textCode === "AUTHENTICATIONFAILED" ||
      error.message?.includes("Invalid credentials");
    res.status(500).json({
      error: isAuthFail
        ? "Gmail authentication failed. Set FROM_EMAIL and a Gmail App Password (not your login password) in backend .env. Enable IMAP in Gmail settings."
        : error.message || "Failed to fetch emails",
    });
  }
};

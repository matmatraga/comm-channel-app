const path = require('path');
const fs = require('fs');

const CHAT_ATTACHMENTS_DIR = path.join(__dirname, '..', 'uploads', 'chat');

exports.downloadChatAttachment = (req, res) => {
  const { filename } = req.params;

  if (!filename) {
    return res.status(400).send('Filename is required');
  }

  const filePath = path.join(CHAT_ATTACHMENTS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Error downloading chat file:', err);
      res.status(500).send('Could not download chat file');
    }
  });
};

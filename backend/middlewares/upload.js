const multer = require('multer');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'uploads', 'chat');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
module.exports = upload;
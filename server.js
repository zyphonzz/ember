const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = 3000;
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${crypto.randomBytes(8).toString('hex')}-${file.originalname}`;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage });
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

app.post('/upload', upload.single('file'), (req, res) => {
  const fileUrl = `/uploads/${req.file.filename}`;
  setTimeout(() => {
    fs.unlink(path.join(UPLOADS_DIR, req.file.filename), err => {
      if (err) console.error('Failed to delete', req.file.filename, err);
    });
  }, 3600000)

  res.json({ url: fileUrl });
});
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

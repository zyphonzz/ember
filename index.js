const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl });

  setTimeout(() => {
    fs.unlink(path.join(__dirname, 'uploads', req.file.filename), err => {
      if (err) console.error('Error deleting file:', err);
      else console.log('Deleted:', req.file.filename);
    });
  }, 3600000); // 1 hour
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

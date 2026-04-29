const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const { UPLOAD_DIR, MAX_UPLOAD_SIZE } = require('../config/env');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? ext : '';
    const name = (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`) + safeExt;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.mimetype)) return cb(new Error('Tipo não permitido. Envie PNG/JPG/WEBP.'));
    cb(null, true);
  },
});

module.exports = { upload, UPLOAD_DIR, MAX_UPLOAD_SIZE };

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const FileType = require('file-type');
const { UPLOAD_DIR } = require('../config/env');

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

// Mapa de MIME type → extensão canônica
const MIME_TO_EXT = {
  'image/png':  '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  // Salva com UUID sem extensão — a extensão correta é adicionada
  // após a validação do conteúdo real do arquivo (veja `single` abaixo).
  filename: (req, file, cb) => {
    const name = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    cb(null, name);
  },
});

const baseUpload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Tipo não permitido. Envie PNG/JPG/WEBP.'));
    }
    cb(null, true);
  },
});

function containsUnsafeMarkup(buffer) {
  const sample = buffer.slice(0, 4096).toString('utf8').toLowerCase();
  return ['<svg', '<script', '<html', '<!doctype html', 'javascript:', '<iframe'].some((snippet) => sample.includes(snippet));
}

/**
 * Valida o arquivo armazenado pelo conteúdo real (magic bytes).
 * Retorna a extensão correta detectada (ex: '.jpg').
 * Lança Error se inválido ou inseguro.
 */
async function validateStoredFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const type = await FileType.fromBuffer(buffer);

  if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
    throw new Error('Arquivo inválido.');
  }

  if (containsUnsafeMarkup(buffer)) {
    throw new Error('Arquivo rejeitado por conteúdo potencialmente inseguro.');
  }

  return MIME_TO_EXT[type.mime]; // ex: '.jpg'
}

function removeFileSafely(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // noop
  }
}

function single(fieldName) {
  const middleware = baseUpload.single(fieldName);

  return (req, res, next) => {
    middleware(req, res, async (err) => {
      if (err) return next(err);
      if (!req.file) return next();

      try {
        // Detecta a extensão real pelo conteúdo do arquivo
        const detectedExt = await validateStoredFile(req.file.path);

        // Renomeia somente se a extensão atual estiver incorreta ou ausente
        const currentExt = path.extname(req.file.filename).toLowerCase();
        if (currentExt !== detectedExt) {
          const newFilename = path.basename(req.file.filename, currentExt) + detectedExt;
          const newPath = path.join(UPLOAD_DIR, newFilename);
          fs.renameSync(req.file.path, newPath);

          // Atualiza o objeto req.file para refletir o novo nome/path
          req.file.filename = newFilename;
          req.file.path = newPath;
        }

        return next();
      } catch (validationError) {
        removeFileSafely(req.file.path);
        return next(validationError);
      }
    });
  };
}

const upload = { single };

module.exports = {
  ALLOWED_MIME_TYPES,
  MAX_UPLOAD_SIZE,
  UPLOAD_DIR,
  upload,
};
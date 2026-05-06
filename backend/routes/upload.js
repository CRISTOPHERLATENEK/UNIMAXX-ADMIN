const multer   = require('multer');
const path     = require('path');
const crypto   = require('crypto');
const fs       = require('fs');
const FileType = require('file-type');
const { UPLOAD_DIR } = require('../config/env');

// Sharp é opcional — se não instalado, o upload funciona sem otimização
let sharp;
try { sharp = require('sharp'); } catch { sharp = null; }

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// memoryStorage → processa com Sharp antes de gravar no disco
const baseUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype))
      return cb(new Error('Tipo não permitido. Envie PNG/JPG/WEBP.'));
    cb(null, true);
  },
});

const MIME_TO_EXT = {
  'image/png':  '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

function containsUnsafeMarkup(buffer) {
  const sample = buffer.slice(0, 4096).toString('utf8').toLowerCase();
  return ['<svg', '<script', '<html', '<!doctype html', 'javascript:', '<iframe'].some(s => sample.includes(s));
}

/**
 * processImage(buffer)
 *
 * 1. Valida magic bytes
 * 2. Gera variantes WebP (1920 / 960 / 480) quando Sharp disponível
 * 3. Sem Sharp: salva buffer original com extensão correta
 *
 * Retorna { filename, variants }
 *   filename → arquivo principal  (/uploads/<uuid>.webp  ou original)
 *   variants → { lg, md, sm }     ou null sem Sharp
 */
async function processImage(buffer) {
  // Validação de conteúdo real (magic bytes)
  const type = await FileType.fromBuffer(buffer);
  if (!type || !ALLOWED_MIME_TYPES.includes(type.mime))
    throw new Error('Arquivo inválido.');
  if (containsUnsafeMarkup(buffer))
    throw new Error('Arquivo rejeitado por conteúdo potencialmente inseguro.');

  const baseName = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

  // ── Sem Sharp: salva original ─────────────────────────────────────────────
  if (!sharp) {
    const ext = MIME_TO_EXT[type.mime] || '.jpg';
    const filename = baseName + ext;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
    return { filename, variants: null };
  }

  // ── Com Sharp: gera 3 variantes WebP otimizadas ───────────────────────────
  const meta  = await sharp(buffer).metadata();
  const origW = meta.width || 1920;

  const VARIANTS = [
    { key: 'lg', suffix: '',    maxW: 1920, quality: 85 },
    { key: 'md', suffix: '-md', maxW: 960,  quality: 82 },
    { key: 'sm', suffix: '-sm', maxW: 480,  quality: 80 },
  ];

  const variants = {};
  for (const v of VARIANTS) {
    const targetW  = Math.min(origW, v.maxW);
    const filename = `${baseName}${v.suffix}.webp`;
    await sharp(buffer)
      .resize(targetW, null, { withoutEnlargement: true, fit: 'inside' })
      .webp({ quality: v.quality, effort: 4 })
      .toFile(path.join(UPLOAD_DIR, filename));
    variants[v.key] = `/uploads/${filename}`;
  }

  return { filename: `${baseName}.webp`, variants };
}

function single(fieldName) {
  const middleware = baseUpload.single(fieldName);

  return (req, res, next) => {
    middleware(req, res, async (err) => {
      if (err) return next(err);
      if (!req.file) return next();

      try {
        const { filename, variants } = await processImage(req.file.buffer);
        // Expõe no req.file para o handler da rota
        req.file.filename  = filename;
        req.file.path      = path.join(UPLOAD_DIR, filename);
        req.file._variants = variants;   // { lg, md, sm } ou null
        return next();
      } catch (e) {
        return next(e);
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
  processImage,
};

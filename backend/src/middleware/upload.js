const multer = require('multer');
const path   = require('path');
const crypto = require('crypto');
const fs     = require('fs');
const { UPLOAD_DIR, MAX_UPLOAD_SIZE } = require('../config/env');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Sharp é opcional — se não instalado, upload funciona sem otimização
let sharp;
try { sharp = require('sharp'); } catch { sharp = null; }

// memoryStorage para processar com Sharp antes de gravar no disco
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/webp'];
    if (!allowed.includes(file.mimetype))
      return cb(new Error('Tipo não permitido. Envie PNG/JPG/WEBP.'));
    cb(null, true);
  },
});

/**
 * processImage(buffer, originalName)
 *
 * Gera até 3 variantes WebP no UPLOAD_DIR:
 *   <uuid>.webp       → máx 1920px  (desktop)
 *   <uuid>-md.webp    → máx 960px   (tablet)
 *   <uuid>-sm.webp    → máx 480px   (mobile)
 *
 * Retorna { filename, variants } com os paths relativos para srcset.
 * Sem Sharp: grava o buffer bruto e retorna variants: null.
 */
async function processImage(buffer, originalName) {
  const baseName = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

  if (!sharp) {
    const ext = path.extname(originalName || '').toLowerCase();
    const safeExt = ['.png', '.jpg', '.jpeg', '.webp'].includes(ext) ? ext : '.jpg';
    const filename = baseName + safeExt;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
    return { filename, variants: null };
  }

  const meta   = await sharp(buffer).metadata();
  const origW  = meta.width || 1920;

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

  return {
    filename: `${baseName}.webp`,
    variants,                        // { lg, md, sm }
  };
}

module.exports = { upload, UPLOAD_DIR, MAX_UPLOAD_SIZE, processImage };

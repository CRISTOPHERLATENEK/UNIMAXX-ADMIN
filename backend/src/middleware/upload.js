const multer = require('multer');
const path   = require('path');
const crypto = require('crypto');
const fs     = require('fs');
const { UPLOAD_DIR, MAX_UPLOAD_SIZE } = require('../config/env');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Sharp é opcional — se não instalado, upload funciona sem otimização
let sharp;
try { sharp = require('sharp'); } catch { sharp = null; }

// file-type verifica o magic-number do arquivo (assinatura nos primeiros bytes),
// não confia no MIME enviado pelo cliente. Defesa contra upload de exe/script
// renomeado pra .png. v16 da lib é CommonJS — ideal pro nosso setup.
const fileType = require('file-type');

const ALLOWED_MIMES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

// memoryStorage para processar com Sharp antes de gravar no disco
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_SIZE },
  fileFilter: (req, file, cb) => {
    // Primeira camada: MIME declarado pelo cliente (rápido, mas spoofable)
    if (!ALLOWED_MIMES.includes(file.mimetype))
      return cb(new Error('Tipo não permitido. Envie PNG/JPG/WEBP/GIF.'));
    cb(null, true);
  },
});

/**
 * verifyMagicNumber(buffer)
 * Verifica os primeiros bytes do arquivo para confirmar que é REALMENTE imagem.
 * Lança erro se o magic-number não corresponder a uma imagem permitida.
 * Use depois do multer, antes de gravar no disco.
 */
async function verifyMagicNumber(buffer) {
  const detected = await fileType.fromBuffer(buffer);
  if (!detected) {
    throw new Error('Não foi possível identificar o tipo do arquivo. Apenas PNG/JPG/WEBP/GIF são aceitos.');
  }
  if (!ALLOWED_MIMES.includes(detected.mime)) {
    throw new Error(`Tipo de arquivo "${detected.mime}" não permitido. Envie PNG/JPG/WEBP/GIF.`);
  }
  return detected;
}

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
  // Verifica magic-number ANTES de gravar — dispara erro se não for imagem real.
  await verifyMagicNumber(buffer);

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

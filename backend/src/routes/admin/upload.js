const router = require('express').Router();
const { upload, MAX_UPLOAD_SIZE, processImage } = require('../../middleware/upload');
const { logAudit } = require('../../utils/audit');

function handleUploadError(err, req, res, next) {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE')
      return res.status(413).json({ error: `Imagem muito grande. Máximo: ${Math.round(MAX_UPLOAD_SIZE / (1024 * 1024))}MB.` });
    return res.status(400).json({ error: err.message || 'Erro no upload' });
  }
  next();
}

// POST /api/admin/upload
// Aceita { image: File } e devolve:
//   { url, srcset: { lg, md, sm } }
//
// O campo `url` aponta sempre para a variante 1920px (ou o arquivo original
// quando Sharp não está instalado) — compatível com código legado que só usa `url`.
// O campo `srcset` é usado pelo frontend para <img srcset="..."> responsivo.
router.post('/', upload.single('image'), handleUploadError, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });

  try {
    const { filename, variants } = await processImage(req.file.buffer, req.file.originalname);
    const url = `/uploads/${filename}`;

    await logAudit(req, {
      userId:   req.user?.id,
      action:   'upload_image',
      entity:   'uploads',
      entityId: filename,
      details:  {
        originalName: req.file.originalname,
        size:         req.file.size,
        optimized:    !!variants,
        variants,
      },
    });

    // Resposta retrocompatível: `url` sempre presente, `srcset` presente quando Sharp disponível
    res.json({
      url,
      srcset: variants ?? null,       // null quando Sharp não instalado
    });
  } catch (err) {
    console.error('[upload] processImage error:', err);
    res.status(500).json({ error: 'Erro ao processar imagem' });
  }
});

module.exports = router;

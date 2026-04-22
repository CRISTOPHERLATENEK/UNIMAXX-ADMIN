const router = require('express').Router();
const { upload, MAX_UPLOAD_SIZE } = require('../../middleware/upload');
const { logAudit } = require('../../utils/audit');

// Erro de tamanho tratado antes do handler principal
function handleUploadError(err, req, res, next) {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: `Imagem muito grande. Máximo: ${Math.round(MAX_UPLOAD_SIZE / (1024 * 1024))}MB.` });
    }
    return res.status(400).json({ error: err.message || 'Erro no upload' });
  }
  next();
}

router.post('/', upload.single('image'), handleUploadError, async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });

  await logAudit(req, {
    userId: req.user?.id,
    action: 'upload_image',
    entity: 'uploads',
    entityId: req.file.filename,
    details: { originalName: req.file.originalname, size: req.file.size },
  });

  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
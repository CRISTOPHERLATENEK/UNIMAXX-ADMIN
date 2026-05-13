const router = require('express').Router();
const fs = require('fs');
const path = require('path');
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

// GET /api/admin/upload — list media files
router.get('/', (req, res) => {
  const uploadsDir = path.join(__dirname, '..', '..', '..', 'uploads');
  try {
    if (!fs.existsSync(uploadsDir)) return res.json([]);
    const files = fs.readdirSync(uploadsDir)
      .filter(f => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(f) && !/-(?:md|sm)\.webp$/.test(f))
      .map(f => {
        const stat = fs.statSync(path.join(uploadsDir, f));
        return { filename: f, url: `/uploads/${f}`, size: stat.size, created_at: stat.birthtime.toISOString() };
      })
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    res.json(files);
  } catch (e) { res.status(500).json({ error: 'Erro ao listar arquivos' }); }
});

// DELETE /api/admin/upload/file/:filename — delete a media file
router.delete('/file/:filename', (req, res) => {
  const uploadsDir = path.join(__dirname, '..', '..', '..', 'uploads');
  const filename = req.params.filename.replace(/[^a-zA-Z0-9._-]/g, '');
  const filePath = path.join(uploadsDir, filename);
  try {
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Arquivo não encontrado' });
    fs.unlinkSync(filePath);
    // Also remove variants (md/sm)
    const base = filename.replace(/\.[^.]+$/, '');
    const ext = '.webp';
    ['-md', '-sm'].forEach(suffix => {
      const vp = path.join(uploadsDir, base + suffix + ext);
      if (fs.existsSync(vp)) fs.unlinkSync(vp);
    });
    res.json({ message: 'Arquivo excluído' });
  } catch (e) { res.status(500).json({ error: 'Erro ao excluir' }); }
});

module.exports = router;

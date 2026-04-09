const router = require('express').Router();
const { upload } = require('../../middleware/upload');

router.post('/', (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'Imagem muito grande. Máximo: 20MB.' });
      return res.status(400).json({ error: err.message || 'Erro no upload' });
    }
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    res.json({ url: `/uploads/${req.file.filename}` });
  });
});

module.exports = router;

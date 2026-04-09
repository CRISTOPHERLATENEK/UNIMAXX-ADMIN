const router = require('express').Router();
const { db } = require('../../db/database');

// CREATE
router.post('/', (req, res) => {
  const {
    title = '', subtitle = '', description = '', image = '',
    cta_text = '', cta_link = '', order_num = 0, active = 1,
    use_default_bg = 1, bg_color = '#f97316',
    page = 'home', banner_style = 'cinematic', use_style = 1,
  } = req.body || {};

  db.run(
    `INSERT INTO banners
      (title, subtitle, description, image, cta_text, cta_link,
       order_num, active, use_default_bg, bg_color, page, banner_style, use_style)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [title, subtitle, description, image, cta_text, cta_link,
     order_num, active, use_default_bg, bg_color, page, banner_style, use_style],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao criar banner', detail: err.message });
      res.json({ ok: true, id: this.lastID });
    }
  );
});

// UPDATE
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const {
    title, subtitle, description, image,
    cta_text, cta_link, order_num, active,
    use_default_bg, bg_color, page, banner_style, use_style,
  } = req.body || {};

  db.run(
    `UPDATE banners SET
      title=?, subtitle=?, description=?, image=?,
      cta_text=?, cta_link=?, order_num=?, active=?,
      use_default_bg=?, bg_color=?, page=?, banner_style=?, use_style=?
     WHERE id=?`,
    [title, subtitle, description, image,
     cta_text, cta_link, order_num, active,
     use_default_bg, bg_color, page || 'home', banner_style || 'cinematic', use_style ?? 1,
     id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar banner', detail: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Banner não encontrado' });
      res.json({ ok: true });
    }
  );
});

// DELETE — remove de verdade
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  db.run('DELETE FROM banners WHERE id=?', [id], function (err) {
    if (err) return res.status(500).json({ error: 'Erro ao excluir banner', detail: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Banner não encontrado' });
    res.json({ ok: true });
  });
});

module.exports = router;

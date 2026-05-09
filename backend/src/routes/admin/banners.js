const router = require('express').Router();
const { db } = require('../../db/database');
const fs = require('fs');
const path = require('path');
const { UPLOAD_DIR } = require('../../config/env');

// CREATE
router.post('/', (req, res) => {
  const {
    title = '', subtitle = '', description = '', image = '',
    cta_text = '', cta_link = '', order_num = 0, active = 1,
    use_default_bg = 1, bg_color = '#f97316',
    page = 'home', banner_style = 'cinematic', use_style = 1,
    starts_at = null, ends_at = null,
    // Novos campos avançados
    image_opacity = 0.5,
    text_align = 'left',
    text_position = 'left',
    banner_height = 'md',
    overlay_intensity = 0.85,
    cta2_text = '',
    cta2_link = '',
    badge_icon = '',
    accent_color2 = '',
  } = req.body || {};

  db.run(
    `INSERT INTO banners
      (title, subtitle, description, image, cta_text, cta_link,
       order_num, active, use_default_bg, bg_color, page, banner_style, use_style,
       starts_at, ends_at,
       image_opacity, text_align, text_position, banner_height, overlay_intensity,
       cta2_text, cta2_link, badge_icon, accent_color2)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [title, subtitle, description, image, cta_text, cta_link,
     order_num, active, use_default_bg, bg_color, page, banner_style, use_style,
     starts_at, ends_at,
     image_opacity, text_align, text_position, banner_height, overlay_intensity,
     cta2_text, cta2_link, badge_icon, accent_color2],
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
    starts_at, ends_at,
    // Novos campos avançados
    image_opacity,
    text_align,
    text_position,
    banner_height,
    overlay_intensity,
    cta2_text,
    cta2_link,
    badge_icon,
    accent_color2,
  } = req.body || {};

  db.run(
    `UPDATE banners SET
      title=?, subtitle=?, description=?, image=?,
      cta_text=?, cta_link=?, order_num=?, active=?,
      use_default_bg=?, bg_color=?, page=?, banner_style=?, use_style=?,
      starts_at=?, ends_at=?,
      image_opacity=?, text_align=?, text_position=?, banner_height=?,
      overlay_intensity=?, cta2_text=?, cta2_link=?,
      badge_icon=?, accent_color2=?
     WHERE id=?`,
    [title, subtitle, description, image,
     cta_text, cta_link, order_num, active,
     use_default_bg, bg_color, page || 'home', banner_style || 'cinematic', use_style ?? 1,
     starts_at ?? null, ends_at ?? null,
     image_opacity ?? 0.5,
     text_align || 'left',
     text_position || 'left',
     banner_height || 'md',
     overlay_intensity ?? 0.85,
     cta2_text || '',
     cta2_link || '',
     badge_icon || '',
     accent_color2 || '',
     id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar banner', detail: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Banner não encontrado' });
      res.json({ ok: true });
    }
  );
});

// DELETE — remove de verdade e exclui arquivo físico
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);

  db.get('SELECT image FROM banners WHERE id=?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Banner não encontrado' });

    const imagePath = row.image;

    db.run('DELETE FROM banners WHERE id=?', [id], function (err2) {
      if (err2) return res.status(500).json({ error: 'Erro ao excluir banner', detail: err2.message });
      if (this.changes > 0 && imagePath) {
        const fullPath = path.join(UPLOAD_DIR, path.basename(imagePath));
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      res.json({ ok: true });
    });
  });
});

module.exports = router;
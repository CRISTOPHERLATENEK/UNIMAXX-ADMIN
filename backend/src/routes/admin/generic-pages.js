const router = require('express').Router();
const { db, parseArr, toJson } = require('../../db/database');
const { validateBody, validateParams } = require('../../middleware/validate');
const { genericPageSchema, numericIdParamSchema } = require('../../validation/admin');
const { logAudit } = require('../../utils/audit');

const FIELDS = ['slug', 'title', 'meta_title', 'meta_description', 'is_active', 'blocks_json', 'show_in_nav', 'nav_label', 'nav_group', 'nav_order'];

function parseRow(row) {
  return {
    ...row,
    is_active: !!row.is_active,
    show_in_nav: !!row.show_in_nav,
    blocks_json: parseArr(row.blocks_json),
  };
}

function buildValues(b) {
  return [
    b.slug,
    b.title,
    b.meta_title || '',
    b.meta_description || '',
    b.is_active ? 1 : 0,
    toJson(b.blocks_json || []),
    b.show_in_nav ? 1 : 0,
    b.nav_label || null,
    b.nav_group || 'standalone',
    b.nav_order ?? 99,
  ];
}

router.get('/', (req, res) => {
  db.all('SELECT * FROM generic_pages WHERE deleted_at IS NULL ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao listar páginas' });
    res.json((rows || []).map(parseRow));
  });
});

router.get('/:id', validateParams(numericIdParamSchema), (req, res) => {
  db.get('SELECT * FROM generic_pages WHERE id=?', [req.validatedParams.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (!row) return res.status(404).json({ error: 'Página não encontrada' });
    res.json(parseRow(row));
  });
});

router.post('/', validateBody(genericPageSchema), (req, res) => {
  const payload = req.validatedBody;
  const cols = FIELDS.join(', ') + ', updated_at';
  const placeholders = FIELDS.map(() => '?').join(', ') + ', CURRENT_TIMESTAMP';
  db.run(`INSERT INTO generic_pages (${cols}) VALUES (${placeholders})`, buildValues(payload), async function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ error: `Slug "${payload.slug}" já existe` });
      return res.status(500).json({ error: 'Erro ao criar: ' + err.message });
    }
    await logAudit(req, { userId: req.user?.id, action: 'create_generic_page', entity: 'generic_pages', entityId: this.lastID, details: { slug: payload.slug, title: payload.title } });
    res.json({ message: 'Criado', id: this.lastID });
  });
});

router.put('/:id', validateParams(numericIdParamSchema), validateBody(genericPageSchema), (req, res) => {
  const payload = req.validatedBody;
  const setClause = FIELDS.map(f => `${f} = ?`).join(', ') + ', updated_at = CURRENT_TIMESTAMP';
  db.run(`UPDATE generic_pages SET ${setClause} WHERE id = ?`, [...buildValues(payload), req.validatedParams.id], async function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ error: `Slug "${payload.slug}" já existe` });
      return res.status(500).json({ error: 'Erro ao atualizar: ' + err.message });
    }
    await logAudit(req, { userId: req.user?.id, action: 'update_generic_page', entity: 'generic_pages', entityId: req.validatedParams.id, details: { slug: payload.slug, title: payload.title } });
    res.json({ message: 'Atualizado' });
  });
});

router.delete('/:id', validateParams(numericIdParamSchema), (req, res) => {
  db.run('UPDATE generic_pages SET deleted_at = CURRENT_TIMESTAMP WHERE id=? AND deleted_at IS NULL', [req.validatedParams.id], async function (err) {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (this.changes === 0) return res.status(404).json({ error: 'Página não encontrada' });
    await logAudit(req, { userId: req.user?.id, action: 'soft_delete_generic_page', entity: 'generic_pages', entityId: req.validatedParams.id });
    res.json({ message: 'Movido para a Lixeira', soft: true });
  });
});

module.exports = router;

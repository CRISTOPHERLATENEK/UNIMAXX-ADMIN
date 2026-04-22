const router = require('express').Router();
const { db, parseArr, toJson } = require('../../db/database');
const { validateBody, validateParams } = require('../../middleware/validate');
const { numericIdParamSchema, pageSchema } = require('../../validation/admin');
const { logAudit } = require('../../utils/audit');

const META_FIELDS = ['slug', 'title', 'icon', 'color_theme', 'meta_title', 'meta_description', 'is_active'];
const FIELDS = [...META_FIELDS, 'blocks_json'];

function parseRow(row) {
  return {
    ...row,
    is_active: !!row.is_active,
    blocks_json: parseArr(row.blocks_json),
  };
}

function buildValues(b) {
  return [
    b.slug,
    b.title,
    b.icon || 'Building2',
    b.color_theme || 'orange',
    b.meta_title || '',
    b.meta_description || '',
    b.is_active ? 1 : 0,
    toJson(b.blocks_json || []),
  ];
}

router.get('/', (req, res) => {
  db.all('SELECT id,slug,title,icon,color_theme,meta_title,meta_description,is_active,blocks_json,created_at,updated_at FROM solution_pages ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao listar páginas' });
    res.json((rows || []).map(parseRow));
  });
});

router.get('/:id', validateParams(numericIdParamSchema), (req, res) => {
  db.get('SELECT id,slug,title,icon,color_theme,meta_title,meta_description,is_active,blocks_json,created_at,updated_at FROM solution_pages WHERE id=?', [req.validatedParams.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (!row) return res.status(404).json({ error: 'Página não encontrada' });
    res.json(parseRow(row));
  });
});

router.post('/', validateBody(pageSchema), (req, res) => {
  const payload = req.validatedBody;
  const cols = FIELDS.join(', ') + ', updated_at';
  const placeholders = FIELDS.map(() => '?').join(', ') + ', CURRENT_TIMESTAMP';
  db.run(`INSERT INTO solution_pages (${cols}) VALUES (${placeholders})`, buildValues(payload), async function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ error: `Slug "${payload.slug}" já existe` });
      return res.status(500).json({ error: 'Erro ao criar: ' + err.message });
    }
    await logAudit(req, { userId: req.user?.id, action: 'create_solution_page', entity: 'solution_pages', entityId: this.lastID, details: { slug: payload.slug, title: payload.title } });
    res.json({ message: 'Criado', id: this.lastID });
  });
});

router.put('/:id', validateParams(numericIdParamSchema), validateBody(pageSchema), (req, res) => {
  const payload = req.validatedBody;
  const setClause = FIELDS.map(f => `${f} = ?`).join(', ') + ', updated_at = CURRENT_TIMESTAMP';
  db.run(`UPDATE solution_pages SET ${setClause} WHERE id = ?`, [...buildValues(payload), req.validatedParams.id], async function (err) {
    if (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ error: `Slug "${payload.slug}" já existe` });
      return res.status(500).json({ error: 'Erro ao atualizar: ' + err.message });
    }
    await logAudit(req, { userId: req.user?.id, action: 'update_solution_page', entity: 'solution_pages', entityId: req.validatedParams.id, details: { slug: payload.slug, title: payload.title } });
    res.json({ message: 'Atualizado' });
  });
});

router.delete('/:id', validateParams(numericIdParamSchema), (req, res) => {
  db.run('DELETE FROM solution_pages WHERE id=?', [req.validatedParams.id], async function (err) {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (this.changes === 0) return res.status(404).json({ error: 'Página não encontrada' });
    await logAudit(req, { userId: req.user?.id, action: 'delete_solution_page', entity: 'solution_pages', entityId: req.validatedParams.id });
    res.json({ message: 'Excluído' });
  });
});

module.exports = router;

const router = require('express').Router();
const { db, parseArr, toJson } = require('../../db/database');
const { validateBody, validateParams } = require('../../middleware/validate');
const { genericPageSchema, numericIdParamSchema } = require('../../validation/admin');
const { logAudit } = require('../../utils/audit');

const FIELDS = ['slug', 'title', 'meta_title', 'meta_description', 'is_active', 'blocks_json', 'show_in_nav', 'nav_label', 'nav_group', 'nav_order', 'published_at', 'expires_at'];

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
    b.published_at || null,
    b.expires_at || null,
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
  // Save current version before overwriting
  db.get('SELECT title, blocks_json FROM generic_pages WHERE id=?', [req.validatedParams.id], (verErr, current) => {
    if (!verErr && current) {
      db.run('INSERT INTO page_versions (page_id, title, blocks_json, saved_by) VALUES (?, ?, ?, ?)',
        [req.validatedParams.id, current.title, current.blocks_json, req.user?.email || 'admin'],
        () => {}
      );
      // Keep only last 10 versions
      db.run('DELETE FROM page_versions WHERE page_id=? AND id NOT IN (SELECT id FROM page_versions WHERE page_id=? ORDER BY created_at DESC LIMIT 10)',
        [req.validatedParams.id, req.validatedParams.id]);
    }
  });
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

router.post('/:id/duplicate', validateParams(numericIdParamSchema), (req, res) => {
  db.get('SELECT * FROM generic_pages WHERE id=? AND deleted_at IS NULL', [req.validatedParams.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (!row) return res.status(404).json({ error: 'Página não encontrada' });
    const newSlug = row.slug + '-copia-' + Date.now().toString(36);
    const newTitle = row.title + ' (Cópia)';
    db.run(
      `INSERT INTO generic_pages (slug, title, meta_title, meta_description, is_active, blocks_json, show_in_nav, nav_label, nav_group, nav_order, updated_at)
       VALUES (?, ?, ?, ?, 0, ?, 0, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [newSlug, newTitle, row.meta_title || '', row.meta_description || '', row.blocks_json || '[]', row.nav_label, row.nav_group || 'standalone', row.nav_order ?? 99],
      async function(err2) {
        if (err2) return res.status(500).json({ error: 'Erro ao duplicar: ' + err2.message });
        await logAudit(req, { userId: req.user?.id, action: 'duplicate_generic_page', entity: 'generic_pages', entityId: this.lastID, details: { originalId: req.validatedParams.id, newSlug } });
        res.json({ message: 'Duplicado', id: this.lastID, slug: newSlug });
      }
    );
  });
});

// Ensure versions table exists
db.run(`CREATE TABLE IF NOT EXISTS page_versions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id INTEGER NOT NULL,
  blocks_json TEXT,
  title TEXT,
  saved_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// GET /admin/generic-pages/:id/versions — list last 10 versions
router.get('/:id/versions', validateParams(numericIdParamSchema), (req, res) => {
  db.all(
    'SELECT id, page_id, title, saved_by, created_at FROM page_versions WHERE page_id=? ORDER BY created_at DESC LIMIT 10',
    [req.validatedParams.id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erro' });
      res.json(rows || []);
    }
  );
});

// GET /admin/generic-pages/:id/versions/:vid — get specific version blocks
router.get('/:id/versions/:vid', validateParams(numericIdParamSchema), (req, res) => {
  db.get('SELECT * FROM page_versions WHERE id=? AND page_id=?', [req.params.vid, req.validatedParams.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (!row) return res.status(404).json({ error: 'Versão não encontrada' });
    res.json({ ...row, blocks_json: parseArr(row.blocks_json) });
  });
});

module.exports = router;

// admin/generic-pages.js — CRUD para páginas genéricas via Page Builder
const router = require('express').Router();
const { db, parseArr, toJson } = require('../../db/database');

const FIELDS = ['slug','title','meta_title','meta_description','is_active','blocks_json'];

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
    b.meta_title || '',
    b.meta_description || '',
    b.is_active ? 1 : 0,
    toJson(b.blocks_json || []),
  ];
}

// GET /admin/generic-pages
router.get('/', (req, res) => {
  db.all('SELECT * FROM generic_pages ORDER BY id DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao listar páginas' });
    res.json((rows || []).map(parseRow));
  });
});

// GET /admin/generic-pages/:id
router.get('/:id', (req, res) => {
  db.get('SELECT * FROM generic_pages WHERE id=?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (!row) return res.status(404).json({ error: 'Página não encontrada' });
    res.json(parseRow(row));
  });
});

// POST /admin/generic-pages
router.post('/', (req, res) => {
  const b = req.body || {};
  if (!b.slug || !b.title) return res.status(400).json({ error: 'slug e title são obrigatórios' });
  const cols = FIELDS.join(', ') + ', updated_at';
  const placeholders = FIELDS.map(() => '?').join(', ') + ', CURRENT_TIMESTAMP';
  db.run(`INSERT INTO generic_pages (${cols}) VALUES (${placeholders})`, buildValues(b), function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ error: `Slug "${b.slug}" já existe` });
      return res.status(500).json({ error: 'Erro ao criar: ' + err.message });
    }
    res.json({ message: 'Criado', id: this.lastID });
  });
});

// PUT /admin/generic-pages/:id
router.put('/:id', (req, res) => {
  const b = req.body || {};
  const setClause = FIELDS.map(f => `${f} = ?`).join(', ') + ', updated_at = CURRENT_TIMESTAMP';
  db.run(`UPDATE generic_pages SET ${setClause} WHERE id = ?`, [...buildValues(b), req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Erro ao atualizar: ' + err.message });
    res.json({ message: 'Atualizado' });
  });
});

// DELETE /admin/generic-pages/:id
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM generic_pages WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json({ message: 'Excluído' });
  });
});

module.exports = router;

const router = require('express').Router();
const { db } = require('../../db/database');

// Ensure table exists
db.run(`CREATE TABLE IF NOT EXISTS redirects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  from_path TEXT NOT NULL UNIQUE,
  to_path TEXT NOT NULL,
  status_code INTEGER DEFAULT 301,
  active INTEGER DEFAULT 1,
  hits INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

router.get('/', (req, res) => {
  db.all('SELECT * FROM redirects ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});

router.post('/', (req, res) => {
  const { from_path, to_path, status_code = 301 } = req.body || {};
  if (!from_path?.trim() || !to_path?.trim()) return res.status(400).json({ error: 'from_path e to_path obrigatórios' });
  const from = from_path.trim().startsWith('/') ? from_path.trim() : '/' + from_path.trim();
  const to = to_path.trim();
  db.run('INSERT INTO redirects (from_path, to_path, status_code) VALUES (?, ?, ?)', [from, to, status_code], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) return res.status(409).json({ error: `Redirect para "${from}" já existe` });
      return res.status(500).json({ error: 'Erro ao criar' });
    }
    res.json({ id: this.lastID, from_path: from, to_path: to, status_code, active: 1, hits: 0 });
  });
});

router.put('/:id', (req, res) => {
  const { from_path, to_path, status_code, active } = req.body || {};
  db.run('UPDATE redirects SET from_path=?, to_path=?, status_code=?, active=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
    [from_path, to_path, status_code ?? 301, active ?? 1, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar' });
      if (this.changes === 0) return res.status(404).json({ error: 'Não encontrado' });
      res.json({ message: 'Atualizado' });
    });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM redirects WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (this.changes === 0) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Excluído' });
  });
});

module.exports = router;

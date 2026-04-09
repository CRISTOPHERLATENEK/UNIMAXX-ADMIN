const router = require('express').Router();
const { db } = require('../../db/database');

// GET /admin/leads - list all leads
router.get('/', (req, res) => {
  db.all('SELECT id, name, phone, email, segment, message, company, subject, read_at, created_at FROM leads ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar leads' });
    res.json(rows || []);
  });
});

// DELETE /admin/leads/:id
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM leads WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro ao deletar lead' });
    res.json({ ok: true });
  });
});

// PATCH /admin/leads/:id/read
router.patch('/:id/read', (req, res) => {
  db.run('UPDATE leads SET read_at = CURRENT_TIMESTAMP WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json({ ok: true });
  });
});

module.exports = router;

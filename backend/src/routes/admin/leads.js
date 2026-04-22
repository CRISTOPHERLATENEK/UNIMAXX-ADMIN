const router = require('express').Router();
const { db } = require('../../db/database');
const { auditMiddleware } = require('../../middleware/auditLog');

// GET /admin/leads - list all leads
router.get('/', (req, res) => {
  db.all('SELECT id, name, phone, email, segment, message, company, subject, read_at, created_at FROM leads ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar leads' });
    res.json(rows || []);
  });
});

// GET /admin/leads/unread-count
router.get('/unread-count', (req, res) => {
  db.get('SELECT COUNT(*) as count FROM leads WHERE read_at IS NULL', [], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json({ count: row?.count || 0 });
  });
});

// GET /admin/leads/export - CSV export
router.get('/export', (req, res) => {
  db.all('SELECT * FROM leads ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao exportar leads' });
    const escape = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
    const csv = [
      'ID,Nome,Email,Telefone,Empresa,Assunto,Segmento,Mensagem,Lido em,Data',
      ...(rows || []).map(r => [
        r.id, escape(r.name), escape(r.email), escape(r.phone),
        escape(r.company), escape(r.subject), escape(r.segment),
        escape(r.message), escape(r.read_at || ''), escape(r.created_at)
      ].join(','))
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=leads.csv');
    res.send('\uFEFF' + csv); // BOM for Excel compatibility
  });
});

// DELETE /admin/leads/:id
router.delete('/:id', auditMiddleware('DELETE', 'lead'), (req, res) => {
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

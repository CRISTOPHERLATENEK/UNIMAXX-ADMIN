const router = require('express').Router();
const { db }  = require('../../db/database');

// GET /admin/newsletter — listar inscritos
router.get('/', (req, res) => {
  const { search, status, page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let where  = 'WHERE 1=1';
  const params = [];

  if (search) {
    where += ' AND (email LIKE ? OR name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status === 'active')      { where += ' AND unsubscribed_at IS NULL'; }
  else if (status === 'unsub')  { where += ' AND unsubscribed_at IS NOT NULL'; }

  db.get(`SELECT COUNT(*) as total FROM newsletter_subscribers ${where}`, params, (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    const total = row.total;

    db.all(
      `SELECT * FROM newsletter_subscribers ${where} ORDER BY subscribed_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset],
      (err2, rows) => {
        if (err2) return res.status(500).json({ error: 'Erro' });
        res.json({ subscribers: rows || [], total, page: parseInt(page), limit: parseInt(limit) });
      }
    );
  });
});

// DELETE /admin/newsletter/:id — remover inscrito
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM newsletter_subscribers WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json({ ok: true });
  });
});

// PATCH /admin/newsletter/:id/unsubscribe — desinscrever manualmente
router.patch('/:id/unsubscribe', (req, res) => {
  db.run(
    'UPDATE newsletter_subscribers SET unsubscribed_at = CURRENT_TIMESTAMP WHERE id = ?',
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro' });
      res.json({ ok: true });
    }
  );
});

// GET /admin/newsletter/export — exportar CSV
router.get('/export', (req, res) => {
  db.all(
    'SELECT email, name, source, subscribed_at, unsubscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erro' });
      const header = 'Email,Nome,Origem,Data Inscrição,Data Cancelamento';
      const lines  = rows.map(r =>
        [r.email, r.name || '', r.source || 'rodapé', r.subscribed_at, r.unsubscribed_at || '']
          .map(v => `"${String(v).replace(/"/g, '""')}"`)
          .join(',')
      );
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="newsletter.csv"');
      res.send('\uFEFF' + [header, ...lines].join('\n'));
    }
  );
});

module.exports = router;

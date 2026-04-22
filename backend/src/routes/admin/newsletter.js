const router = require('express').Router();
const { db } = require('../../db/database');
const { validateParams } = require('../../middleware/validate');
const { numericIdParamSchema } = require('../../validation/admin');
const { logAudit } = require('../../utils/audit');

router.get('/', (req, res) => {
  const { search, status, page = 1, limit = 50 } = req.query;
  const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
  const offset = (parsedPage - 1) * parsedLimit;

  let where = 'WHERE 1=1';
  const params = [];

  if (search) {
    where += ' AND (email LIKE ? OR name LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status === 'active') where += ' AND unsubscribed_at IS NULL';
  else if (status === 'unsub') where += ' AND unsubscribed_at IS NOT NULL';

  db.get(`SELECT COUNT(*) as total FROM newsletter_subscribers ${where}`, params, (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    const total = row.total;

    db.all(
      `SELECT * FROM newsletter_subscribers ${where} ORDER BY subscribed_at DESC LIMIT ? OFFSET ?`,
      [...params, parsedLimit, offset],
      (err2, rows) => {
        if (err2) return res.status(500).json({ error: 'Erro' });
        res.json({ subscribers: rows || [], total, page: parsedPage, limit: parsedLimit });
      }
    );
  });
});

router.delete('/:id', validateParams(numericIdParamSchema), (req, res) => {
  db.run('DELETE FROM newsletter_subscribers WHERE id = ?', [req.validatedParams.id], async function (err) {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (this.changes === 0) return res.status(404).json({ error: 'Inscrito não encontrado' });
    await logAudit(req, { userId: req.user?.id, action: 'delete_newsletter_subscriber', entity: 'newsletter_subscribers', entityId: req.validatedParams.id });
    res.json({ ok: true });
  });
});

router.patch('/:id/unsubscribe', validateParams(numericIdParamSchema), (req, res) => {
  db.run(
    'UPDATE newsletter_subscribers SET unsubscribed_at = CURRENT_TIMESTAMP WHERE id = ?',
    [req.validatedParams.id],
    async function (err) {
      if (err) return res.status(500).json({ error: 'Erro' });
      if (this.changes === 0) return res.status(404).json({ error: 'Inscrito não encontrado' });
      await logAudit(req, { userId: req.user?.id, action: 'unsubscribe_newsletter_subscriber', entity: 'newsletter_subscribers', entityId: req.validatedParams.id });
      res.json({ ok: true });
    }
  );
});

router.get('/export', (req, res) => {
  db.all(
    'SELECT email, name, source, subscribed_at, unsubscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erro' });
      const header = 'Email,Nome,Origem,Data Inscrição,Data Cancelamento';
      const lines = rows.map(r =>
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

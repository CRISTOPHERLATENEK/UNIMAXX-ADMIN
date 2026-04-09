const router = require('express').Router();
const crypto = require('crypto');
const { db } = require('../../db/database');

// POST /api/newsletter/subscribe
router.post('/subscribe', (req, res) => {
  const { email, name = '', source = 'rodapé' } = req.body || {};

  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'E-mail é obrigatório' });
  }

  const emailLower = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailLower)) {
    return res.status(400).json({ error: 'E-mail inválido' });
  }

  const token = crypto.randomUUID();

  db.get('SELECT id, unsubscribed_at FROM newsletter_subscribers WHERE email = ?', [emailLower], (err, row) => {
    if (err) return res.status(500).json({ error: 'Erro interno' });

    if (row) {
      if (!row.unsubscribed_at) {
        return res.json({ ok: true, already: true, message: 'Você já está inscrito!' });
      }
      // estava desinscrito — reinscrever com novo token
      db.run(
        'UPDATE newsletter_subscribers SET unsubscribed_at = NULL, subscribed_at = CURRENT_TIMESTAMP, name = ?, source = ?, unsubscribe_token = ? WHERE id = ?',
        [name.trim(), source, token, row.id],
        (err2) => {
          if (err2) return res.status(500).json({ error: 'Erro ao reinscrever' });
          res.json({ ok: true, message: 'Inscrição renovada com sucesso!' });
        }
      );
      return;
    }

    // novo inscrito
    db.run(
      'INSERT INTO newsletter_subscribers (email, name, source, unsubscribe_token) VALUES (?, ?, ?, ?)',
      [emailLower, name.trim(), source, token],
      function(err2) {
        if (err2) return res.status(500).json({ error: 'Erro ao inscrever' });
        res.json({ ok: true, id: this.lastID, message: 'Inscrito com sucesso!' });
      }
    );
  });
});

// POST /api/newsletter/unsubscribe — exige token único gerado na inscrição
router.post('/unsubscribe', (req, res) => {
  const { token } = req.body || {};
  if (!token || typeof token !== 'string' || token.trim().length < 10) {
    return res.status(400).json({ error: 'Token de cancelamento inválido ou ausente' });
  }

  db.run(
    'UPDATE newsletter_subscribers SET unsubscribed_at = CURRENT_TIMESTAMP WHERE unsubscribe_token = ? AND unsubscribed_at IS NULL',
    [token.trim()],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erro interno' });
      if (this.changes === 0) return res.status(404).json({ error: 'Token inválido ou e-mail já cancelado' });
      res.json({ ok: true, message: 'Inscrição cancelada com sucesso.' });
    }
  );
});

module.exports = router;

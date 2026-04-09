const router = require('express').Router();
const { db } = require('../../db/database');

router.post('/leads', (req, res) => {
  const { name, phone, email, segment, message, company, subject } = req.body || {};
  if (!name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  }

  const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;
  if (!phoneRegex.test(phone.trim())) {
    return res.status(400).json({ error: 'Telefone inválido. Use apenas números, espaços e os caracteres + - ( )' });
  }

  db.run(
    `INSERT INTO leads (name, phone, email, segment, message, company, subject, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [name.trim(), phone.trim(), email?.trim() || '', segment?.trim() || '', message?.trim() || '', company?.trim() || '', subject?.trim() || ''],
    function(err) {
      if (err) {
        console.error('Erro ao salvar lead:', err);
        return res.status(500).json({ error: 'Erro ao salvar contato' });
      }
      res.json({ ok: true, id: this.lastID });
    }
  );
});

module.exports = router;

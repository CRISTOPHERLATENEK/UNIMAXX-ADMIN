const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../../db/database');
const { JWT_SECRET } = require('../../config/env');
const { authenticateToken } = require('../../middleware/auth');

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });

  db.get('SELECT * FROM users WHERE email=?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor' });
    if (!user || !bcrypt.compareSync(password, user.password))
      return res.status(401).json({ error: 'Credenciais inválidas' });
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });
});

router.get('/me', authenticateToken, (req, res) => {
  res.json({ id: req.user.id, email: req.user.email, name: req.user.name });
});

// Update profile (name + email)
router.put('/profile', authenticateToken, (req, res) => {
  const { name, email } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Nome e e-mail são obrigatórios' });

  db.get('SELECT id FROM users WHERE email=? AND id!=?', [email, req.user.id], (err, conflict) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor' });
    if (conflict) return res.status(409).json({ error: 'Este e-mail já está em uso' });

    db.run('UPDATE users SET name=?, email=? WHERE id=?', [name, email, req.user.id], function(err2) {
      if (err2) return res.status(500).json({ error: 'Erro ao atualizar perfil' });
      const token = jwt.sign({ id: req.user.id, email, name }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ message: 'Perfil atualizado', token, user: { id: req.user.id, email, name } });
    });
  });
});

// Change password
router.put('/password', authenticateToken, (req, res) => {
  const { current, newPassword } = req.body || {};
  if (!current || !newPassword) return res.status(400).json({ error: 'Campos obrigatórios' });
  if (newPassword.length < 12) return res.status(400).json({ error: 'Nova senha deve ter ao menos 12 caracteres' });

  db.get('SELECT * FROM users WHERE id=?', [req.user.id], (err, user) => {
    if (err || !user) return res.status(500).json({ error: 'Erro no servidor' });
    if (!bcrypt.compareSync(current, user.password))
      return res.status(401).json({ error: 'Senha atual incorreta' });

    const hash = bcrypt.hashSync(newPassword, 10);
    db.run('UPDATE users SET password=? WHERE id=?', [hash, req.user.id], (err2) => {
      if (err2) return res.status(500).json({ error: 'Erro ao alterar senha' });
      res.json({ message: 'Senha alterada com sucesso' });
    });
  });
});

module.exports = router;

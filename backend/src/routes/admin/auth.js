const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../../db/database');
const { JWT_SECRET, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, NODE_ENV } = require('../../config/env');
const { authenticateToken } = require('../../middleware/auth');
const { audit } = require('../../middleware/auditLog');

// Blacklist em memória para tokens invalidados no logout
const tokenBlacklist = new Set();

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });

  db.get('SELECT * FROM users WHERE email=?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Erro no servidor' });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      return res.status(429).json({ error: `Conta bloqueada. Tente em ${minutesLeft} minuto(s).` });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      const attempts = (user.failed_attempts || 0) + 1;
      if (attempts >= 5) {
        const lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        db.run('UPDATE users SET failed_attempts=?, locked_until=? WHERE id=?', [attempts, lockedUntil, user.id]);
        return res.status(429).json({ error: 'Conta bloqueada por 15 minutos após múltiplas tentativas inválidas.' });
      }
      db.run('UPDATE users SET failed_attempts=? WHERE id=?', [attempts, user.id]);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Reset failed attempts on success
    db.run('UPDATE users SET failed_attempts=0, locked_until=NULL WHERE id=?', [user.id]);

    audit({ userId: user.id, action: 'LOGIN', entity: 'user', entityId: user.id, ip: req.ip });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
    const refreshToken = jwt.sign({ id: user.id, email: user.email, name: user.name, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
    });

    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  });
});

// Refresh token endpoint
router.post('/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken obrigatório' });
  
  if (tokenBlacklist.has(refreshToken)) {
    return res.status(401).json({ error: 'Token invalidado' });
  }

  try {
    const payload = jwt.verify(refreshToken, JWT_SECRET);
    if (payload.type !== 'refresh') return res.status(401).json({ error: 'Token inválido' });
    
    const token = jwt.sign({ id: payload.id, email: payload.email, name: payload.name }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
    const newRefresh = jwt.sign({ id: payload.id, email: payload.email, name: payload.name, type: 'refresh' }, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
    
    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ token });
  } catch {
    res.status(401).json({ error: 'Token expirado ou inválido' });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    tokenBlacklist.add(refreshToken);
  }
  res.clearCookie('refreshToken');
  res.json({ message: 'Logout realizado com sucesso' });
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
      const token = jwt.sign({ id: req.user.id, email, name }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
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

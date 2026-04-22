const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');

const ACCESS_TOKEN_EXPIRES_IN = '2h';
const REFRESH_GRACE_SECONDS = 24 * 60 * 60;

function extractBearerToken(req) {
  const authHeader = req.headers['authorization'] || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return null;
  return token;
}

function signAccessToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );
}

function verifyAccessToken(token, options = {}) {
  return jwt.verify(token, JWT_SECRET, options);
}

function validateRefreshWindow(payload) {
  if (!payload?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return now - payload.exp <= REFRESH_GRACE_SECONDS;
}

const authenticateToken = (req, res, next) => {
  const token = extractBearerToken(req);
  if (!token) return res.status(401).json({ error: 'Token não fornecido' });

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    return res.status(403).json({ error: 'Token inválido' });
  }
};

module.exports = {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_GRACE_SECONDS,
  authenticateToken,
  extractBearerToken,
  signAccessToken,
  validateRefreshWindow,
  verifyAccessToken,
};

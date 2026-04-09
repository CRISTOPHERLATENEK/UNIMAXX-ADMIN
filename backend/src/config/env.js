const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';

function resolveFromBackend(p) {
  if (!p) return null;
  return path.isAbsolute(p) ? p : path.join(__dirname, '../..', p);
}

const JWT_SECRET_ENV = process.env.JWT_SECRET;
if (!JWT_SECRET_ENV && NODE_ENV === 'production') {
  console.error('[FATAL] JWT_SECRET é obrigatório em produção.');
  process.exit(1);
}

module.exports = {
  PORT:         Number(process.env.PORT) || 3001,
  NODE_ENV,
  JWT_SECRET:   JWT_SECRET_ENV || 'dev-secret-change-me',
  DB_PATH:      resolveFromBackend(process.env.DB_PATH    || './database.sqlite'),
  UPLOAD_DIR:   resolveFromBackend(process.env.UPLOAD_DIR || './uploads'),
  CORS_ORIGINS: (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
};

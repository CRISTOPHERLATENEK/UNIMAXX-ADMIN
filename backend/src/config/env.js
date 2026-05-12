const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';

function resolveFromBackend(p) {
  if (!p) return null;
  return path.isAbsolute(p) ? p : path.join(__dirname, '../..', p);
}

const JWT_SECRET_ENV = process.env.JWT_SECRET;
const MIN_SECRET_LENGTH = 32;

if (NODE_ENV === 'production') {
  if (!JWT_SECRET_ENV) {
    console.error('[FATAL] JWT_SECRET é obrigatório em produção.');
    process.exit(1);
  }
  if (JWT_SECRET_ENV.length < MIN_SECRET_LENGTH) {
    console.error(`[FATAL] JWT_SECRET muito curto (${JWT_SECRET_ENV.length} chars). Mínimo: ${MIN_SECRET_LENGTH}. Gere com: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`);
    process.exit(1);
  }
  if (/dev|test|secret|change|password|123|admin/i.test(JWT_SECRET_ENV)) {
    console.error('[FATAL] JWT_SECRET parece ser um valor de exemplo. Use um segredo aleatório real.');
    process.exit(1);
  }
} else if (JWT_SECRET_ENV && JWT_SECRET_ENV.length < MIN_SECRET_LENGTH) {
  console.warn(`[WARN] JWT_SECRET tem ${JWT_SECRET_ENV.length} chars — em produção exigirá pelo menos ${MIN_SECRET_LENGTH}.`);
}

module.exports = {
  PORT:         Number(process.env.PORT) || 3001,
  NODE_ENV,
  JWT_SECRET:   JWT_SECRET_ENV || 'dev-secret-change-me',
  DB_PATH:      resolveFromBackend(process.env.DB_PATH    || './database.sqlite'),
  UPLOAD_DIR:   resolveFromBackend(process.env.UPLOAD_DIR || './uploads'),
  CORS_ORIGINS: (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
  ACCESS_TOKEN_EXPIRES_IN: '2h',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  MAX_UPLOAD_SIZE: Number(process.env.MAX_UPLOAD_SIZE) || 5 * 1024 * 1024,
};

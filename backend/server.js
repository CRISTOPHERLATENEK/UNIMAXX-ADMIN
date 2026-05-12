const express = require('express');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { PORT, CORS_ORIGINS, UPLOAD_DIR } = require('./src/config/env');
const { runMigrations } = require('./src/db/migrations');
const { authenticateToken } = require('./src/middleware/auth');
const { upload } = require('./src/middleware/upload');
const setupHelpModule = require('./src/modules/help');

// ── App ───────────────────────────────────────────────────────────────────
const app = express();
app.set('trust proxy', 1);
app.use(compression({ threshold: 512 }));
app.use(cookieParser());

// ── Security Headers ──────────────────────────────────────────────────────
// CSP balanceado:
// - 'self' como base
// - data:/blob: liberados para imagens (avatars, uploads inline)
// - 'unsafe-inline' em styles porque o site usa style={{}} inline (não tem nonces)
// - script-src restrito ('self' + 'unsafe-inline' apenas se NODE_ENV=development pra Vite HMR)
// - frame-ancestors none impede clickjacking
const isDev = process.env.NODE_ENV !== 'production';
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'font-src': ["'self'", 'https://fonts.gstatic.com', 'data:'],
      'img-src': ["'self'", 'data:', 'blob:', 'https:'],
      'connect-src': ["'self'", ...(isDev ? ['ws:', 'wss:'] : [])],
      'frame-ancestors': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  // HSTS já ativo por padrão em produção via helmet
}));

// ── Rate Limiters ─────────────────────────────────────────────────────────
// Login: 5 tentativas por janela de 15min — agressivo o suficiente para
// frustrar brute-force sem bloquear usuário legítimo que erra a senha 1-2x.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Muitas tentativas de login. Aguarde 15 minutos antes de tentar de novo.' },
  standardHeaders: true,
  legacyHeaders: false,
  // Conta apenas requests que falharam (skip 2xx) — usuários que fazem login OK não consomem cota.
  skipSuccessfulRequests: true,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Limite de uploads atingido. Tente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Public site reads — generoso, mas evita que crawler abusivo derrube o servidor.
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin mutating operations (POST/PUT/DELETE) — limita escrita pra dificultar
// abuso de token vazado ou XSS.
const adminWriteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60, // 60 mutações/minuto = 1/segundo médio, suficiente pra editor humano
  message: { error: 'Muitas operações em pouco tempo. Aguarde um momento.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'GET' || req.method === 'HEAD',
});

// ── CORS ──────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || CORS_ORIGINS.length === 0 || CORS_ORIGINS.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));

// ── Serve uploaded files with explicit CORS so browsers load images correctly
app.use('/uploads', (req, res, next) => {
  // Allow any origin that is permitted by the CORS config (or all origins if none configured)
  const origin = req.headers.origin;
  if (!origin || CORS_ORIGINS.length === 0 || CORS_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
}, express.static(UPLOAD_DIR, {
  maxAge: '7d',
  etag: true,
  lastModified: true,
}));

// ── Apply rate limiters ────────────────────────────────────────────────────
app.use('/api/auth/login', loginLimiter);
app.use('/api/admin/upload', uploadLimiter);
app.use('/api/admin', adminWriteLimiter);
app.use('/api', publicLimiter);

// ── DB ────────────────────────────────────────────────────────────────────
runMigrations();

// ── Cache headers for public routes ───────────────────────────────────────
app.use('/api/data', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  next();
});
app.use('/api/solutions', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  next();
});

// ── Rotas ─────────────────────────────────────────────────────────────────
app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth',   require('./src/routes/admin/auth'));
app.use('/api',        require('./src/routes/public'));
app.use('/api/admin',  require('./src/routes/admin'));

// Help Center (usa authenticateToken e upload internamente)
setupHelpModule(app, require('./src/db/database').db, authenticateToken, upload);

// ── SPA Fallback ──────────────────────────────────────────────────────────
// Serve the frontend's index.html for any non-API, non-asset route so that
// refreshing pages like /solucao-page/:slug works correctly.
const FRONTEND_DIST = path.join(__dirname, '../frontend/dist');
app.use(express.static(FRONTEND_DIST, { maxAge: '1d', etag: true }));
app.get('*', (req, res, next) => {
  // Let API and upload routes pass through
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'), (err) => {
    if (err) next(); // dist not built yet — ignore
  });
});

// ── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));

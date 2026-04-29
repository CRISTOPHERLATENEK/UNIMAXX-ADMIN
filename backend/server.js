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
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// ── Rate Limiters ─────────────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Limite de uploads atingido. Tente em 1 hora.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
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
app.use('/uploads', express.static(UPLOAD_DIR, {
  maxAge: '7d',
  etag: true,
  lastModified: true,
}));

// ── Apply rate limiters ────────────────────────────────────────────────────
app.use('/api/auth/login', loginLimiter);
app.use('/api/admin/upload', uploadLimiter);
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

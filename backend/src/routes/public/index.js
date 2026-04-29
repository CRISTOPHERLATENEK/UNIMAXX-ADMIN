const router = require('express').Router();
const { db, parseArr } = require('../../db/database');

const cache = (s) => (_, res, next) => {
  res.set('Cache-Control', `public, max-age=${s}, stale-while-revalidate=60`);
  next();
};

// ── Conteúdo & Settings ───────────────────────────────────────────────────
router.get('/content', cache(30), (req, res) => {
  db.all('SELECT * FROM site_content', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    const content = {};
    (rows || []).forEach(r => { content[r.key] = r.value; });
    res.json(content);
  });
});

router.get('/settings', cache(30), (req, res) => {
  db.all('SELECT * FROM site_settings', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    const s = {};
    (rows || []).forEach(r => { s[r.key] = r.value; });
    res.json(s);
  });
});

// ── Banners ───────────────────────────────────────────────────────────────
router.get('/banners/all', cache(30), (req, res) => {
  db.all(
    `SELECT * FROM banners
     WHERE active=1
       AND title IS NOT NULL AND title != ''
       AND (starts_at IS NULL OR starts_at <= datetime('now'))
       AND (ends_at IS NULL OR ends_at >= datetime('now'))
     ORDER BY page, order_num`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar banners' });
      res.json(rows || []);
    }
  );
});

// ── Soluções ──────────────────────────────────────────────────────────────
router.get('/solutions', cache(60), (req, res) => {
  db.all('SELECT * FROM solutions WHERE active=1 ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json((rows || []).map(r => ({ ...r, features: parseArr(r.features) })));
  });
});

// ── Segmentos ─────────────────────────────────────────────────────────────
router.get('/segments', cache(60), (req, res) => {
  db.all('SELECT * FROM segments WHERE active=1 ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});

// ── Stats ─────────────────────────────────────────────────────────────────
router.get('/stats', cache(120), (req, res) => {
  db.all('SELECT * FROM stats ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});

// ── Social proof ──────────────────────────────────────────────────────────
router.get('/client-logos', cache(120), (req, res) => {
  db.all('SELECT * FROM client_logos WHERE active=1 ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});

router.get('/testimonials', cache(120), (req, res) => {
  db.all('SELECT * FROM testimonials WHERE active=1 ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});

router.get('/partners', cache(120), (req, res) => {
  db.all('SELECT * FROM partners WHERE active=1 ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});

// ── Solution Pages ────────────────────────────────────────────────────────
// Lista pública: só metadados (sem blocks_json completo)
router.get('/solution-pages', cache(60), (req, res) => {
  db.all(
    `SELECT id, slug, title, icon, color_theme, meta_title, meta_description, is_active, created_at, updated_at
     FROM solution_pages WHERE is_active=1 ORDER BY id ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erro' });
      res.json((rows || []).map(r => ({ ...r, is_active: !!r.is_active })));
    }
  );
});

// Detalhe público: metadados + blocks_json
router.get('/solution-pages/:slug', (req, res) => {
  db.get(
    'SELECT id, slug, title, icon, color_theme, meta_title, meta_description, is_active, blocks_json, created_at, updated_at FROM solution_pages WHERE slug=? AND is_active=1',
    [req.params.slug],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Erro' });
      if (!row) return res.status(404).json({ error: 'Página não encontrada' });
      res.json({ ...row, is_active: !!row.is_active, blocks_json: parseArr(row.blocks_json) });
    }
  );
});

// ── Páginas Genéricas ─────────────────────────────────────────────────────
router.get('/pages/:slug', (req, res) => {
  db.get(
    'SELECT id, slug, title, meta_title, meta_description, is_active, blocks_json, created_at, updated_at FROM generic_pages WHERE slug=? AND is_active=1',
    [req.params.slug],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Erro' });
      if (!row) return res.status(404).json({ error: 'Página não encontrada' });
      res.json({ ...row, is_active: !!row.is_active, blocks_json: parseArr(row.blocks_json) });
    }
  );
});

// ── Leads & Contato ───────────────────────────────────────────────────────
router.use(require('./leads'));

router.post('/contact', (req, res) => {
  const { name, phone, email = '', segment = '', message = '' } = req.body || {};
  if (!name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: 'Nome e telefone são obrigatórios' });
  }
  db.run(
    'INSERT INTO leads (name, phone, email, segment, message) VALUES (?, ?, ?, ?, ?)',
    [name.trim(), phone.trim(), email.trim(), segment.trim(), message.trim()],
    function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao salvar contato' });
      res.json({ ok: true, id: this.lastID });
    }
  );
});

router.use('/newsletter', require('./newsletter'));

// ── Analytics: registrar pageview ─────────────────────────────────────────────
router.post('/track', (req, res) => {
  const { page = '/', referrer = '', session_id = '' } = req.body || {};
  const ip = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').split(',')[0].trim();
  const ua = req.headers['user-agent'] || '';

  // Ignora bots
  if (/bot|crawl|spider|slurp|bingpreview/i.test(ua)) return res.json({ ok: true });

  db.run(
    'INSERT INTO pageviews (page, referrer, ua, ip, session_id) VALUES (?, ?, ?, ?, ?)',
    [page.slice(0, 200), referrer.slice(0, 200), ua.slice(0, 300), ip, session_id.slice(0, 64)],
    () => res.json({ ok: true })
  );
});

module.exports = router;

const router = require('express').Router();
const { db, parseArr } = require('../../db/database');
const rateLimit = require('express-rate-limit');

const contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { error: 'Muitas tentativas. Aguarde 15 minutos.' }, standardHeaders: true, legacyHeaders: false });
const trackLimiter = rateLimit({ windowMs: 60 * 1000, max: 30, message: { error: 'Rate limit' }, standardHeaders: true, legacyHeaders: false });

const cache = (s) => (_, res, next) => {
  res.set('Cache-Control', `public, max-age=${s}, stale-while-revalidate=60`);
  next();
};

const queryAll = (sql, params = []) => new Promise((resolve, reject) =>
  db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows || []))
);

// ── Endpoint único: todos os dados públicos em 1 request ─────────────────
router.get('/public-data', cache(30), async (req, res) => {
  try {
    const [
      content_rows, settings_rows, solutions_rows,
      stats, banners,
      client_logos, testimonials, partners, nav_pages,
    ] = await Promise.all([
      queryAll('SELECT * FROM site_content'),
      queryAll('SELECT * FROM site_settings'),
      queryAll('SELECT * FROM solutions WHERE active=1 AND deleted_at IS NULL ORDER BY order_num'),
      queryAll('SELECT * FROM stats WHERE deleted_at IS NULL ORDER BY order_num'),
      queryAll(`SELECT * FROM banners WHERE active=1 AND deleted_at IS NULL AND title IS NOT NULL AND title != '' AND (starts_at IS NULL OR starts_at <= datetime('now')) AND (ends_at IS NULL OR ends_at >= datetime('now')) ORDER BY page, order_num`),
      queryAll('SELECT * FROM client_logos WHERE active=1 AND deleted_at IS NULL ORDER BY order_num'),
      queryAll('SELECT * FROM testimonials WHERE active=1 AND deleted_at IS NULL ORDER BY order_num'),
      queryAll('SELECT * FROM partners WHERE active=1 AND deleted_at IS NULL ORDER BY order_num'),
      queryAll('SELECT id, slug, title, nav_label, nav_group, nav_order FROM generic_pages WHERE is_active=1 AND show_in_nav=1 AND deleted_at IS NULL ORDER BY nav_order ASC, id ASC'),
    ]);

    const content = {};
    content_rows.forEach(r => { content[r.key] = r.value; });
    const settings = {};
    settings_rows.forEach(r => { settings[r.key] = r.value; });
    const solutions = solutions_rows.map(r => ({ ...r, features: parseArr(r.features) }));

    res.json({ content, settings, solutions, stats, banners, client_logos, testimonials, partners, nav_pages });
  } catch (err) {
    console.error('public-data error:', err);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

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
       AND deleted_at IS NULL
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
  db.all('SELECT * FROM solutions WHERE active=1 AND deleted_at IS NULL ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json((rows || []).map(r => ({ ...r, features: parseArr(r.features) })));
  });
});

// ── Stats ─────────────────────────────────────────────────────────────────
router.get('/stats', cache(120), (req, res) => {
  db.all('SELECT * FROM stats WHERE deleted_at IS NULL ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});

// ── Social proof ──────────────────────────────────────────────────────────
router.get('/client-logos', cache(120), (req, res) => {
  db.all('SELECT * FROM client_logos WHERE active=1 AND deleted_at IS NULL ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});

router.get('/testimonials', cache(120), (req, res) => {
  db.all('SELECT * FROM testimonials WHERE active=1 AND deleted_at IS NULL ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});

router.get('/partners', cache(120), (req, res) => {
  db.all('SELECT * FROM partners WHERE active=1 AND deleted_at IS NULL ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});

// ── Solution Pages ────────────────────────────────────────────────────────
// Lista pública: só metadados (sem blocks_json completo)
router.get('/solution-pages', cache(60), (req, res) => {
  db.all(
    `SELECT id, slug, title, icon, color_theme, meta_title, meta_description, is_active, created_at, updated_at
     FROM solution_pages WHERE is_active=1 AND deleted_at IS NULL ORDER BY id ASC`,
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erro' });
      res.json((rows || []).map(r => ({ ...r, is_active: !!r.is_active })));
    }
  );
});

// Detalhe público por slug — helper compartilhado
function querySolutionPageBySlug(slug, res) {
  db.get(
    'SELECT id, slug, title, icon, color_theme, meta_title, meta_description, is_active, blocks_json, created_at, updated_at FROM solution_pages WHERE slug=? AND is_active=1 AND deleted_at IS NULL',
    [slug],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Erro' });
      if (!row) return res.status(404).json({ error: 'Página não encontrada' });
      res.json({ ...row, is_active: !!row.is_active, blocks_json: parseArr(row.blocks_json) });
    }
  );
}

// Rota canônica sem ambiguidade (fix #6): GET /api/solution-pages/by-slug/:slug
// Deve ser declarada ANTES de /:slug para ter precedência no Express
router.get('/solution-pages/by-slug/:slug', (req, res) => {
  querySolutionPageBySlug(req.params.slug, res);
});

// Compat: /:slug — rejeita slugs puramente numéricos para evitar colisão com IDs
router.get('/solution-pages/:slug', (req, res) => {
  if (/^\d+$/.test(req.params.slug)) {
    return res.status(400).json({ error: 'Use /by-slug/:slug para buscar por slug' });
  }
  querySolutionPageBySlug(req.params.slug, res);
});

// ── Nav Pages — páginas com show_in_nav=1 (para o header do site) ────────
router.get('/nav-pages', cache(60), (req, res) => {
  db.all(
    'SELECT id, slug, title, nav_label, nav_group, nav_order FROM generic_pages WHERE is_active=1 AND show_in_nav=1 AND deleted_at IS NULL ORDER BY nav_order ASC, id ASC',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erro' });
      res.json(rows || []);
    }
  );
});

// ── Redirect middleware ───────────────────────────────────────────────────
router.use((req, res, next) => {
  const reqPath = req.path;
  db.get('SELECT to_path, status_code FROM redirects WHERE from_path=? AND active=1', [reqPath], (err, row) => {
    if (err || !row) return next();
    db.run('UPDATE redirects SET hits=hits+1 WHERE from_path=?', [reqPath]);
    res.redirect(row.status_code || 301, row.to_path);
  });
});

// ── Páginas Genéricas ─────────────────────────────────────────────────────
router.get('/pages/:slug', (req, res) => {
  db.get(
    `SELECT id, slug, title, meta_title, meta_description, is_active, blocks_json, created_at, updated_at FROM generic_pages WHERE slug=? AND is_active=1 AND deleted_at IS NULL AND (published_at IS NULL OR published_at <= datetime('now')) AND (expires_at IS NULL OR expires_at >= datetime('now'))`,
    [req.params.slug],
    (err, row) => {
      if (err) return res.status(500).json({ error: 'Erro' });
      if (!row) return res.status(404).json({ error: 'Página não encontrada' });
      res.json({ ...row, is_active: !!row.is_active, blocks_json: parseArr(row.blocks_json) });
    }
  );
});

// ── Sitemap ───────────────────────────────────────────────────────────────
router.get('/sitemap.xml', (req, res) => {
  db.all(
    `SELECT slug, updated_at FROM generic_pages WHERE is_active=1 AND deleted_at IS NULL`,
    [],
    (err, rows) => {
      const host = process.env.SITE_URL || 'https://seusite.com.br';
      const staticUrls = ['/', '/solucoes', '/cliente', '/suporte'];
      const urls = [
        ...staticUrls.map(u => `<url><loc>${host}${u}</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`),
        ...(rows || []).map(r => `<url><loc>${host}/p/${r.slug}</loc><lastmod>${(r.updated_at || '').slice(0,10)}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>`)
      ];
      res.set('Content-Type', 'application/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`);
    }
  );
});

// ── Leads & Contato ───────────────────────────────────────────────────────
router.use(require('./leads'));

router.use('/contact', contactLimiter);
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
router.use('/track', trackLimiter);
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

router.use('/preview', require('./preview'));

module.exports = router;

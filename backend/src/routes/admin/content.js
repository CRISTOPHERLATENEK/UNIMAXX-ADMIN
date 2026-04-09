const router = require('express').Router();
const { db, parseArr } = require('../../db/database');

const queryAll = (sql) => new Promise((resolve, reject) => {
  db.all(sql, [], (err, rows) => err ? reject(err) : resolve(rows || []));
});

router.put('/content', (req, res) => {
  const updates = req.body || {};
  const entries = Object.entries(updates);
  if (entries.length === 0) return res.json({ message: 'Nada para atualizar' });

  db.serialize(() => {
    const stmt = db.prepare('INSERT OR REPLACE INTO site_content (section, key, value) VALUES (?, ?, ?)');
    entries.forEach(([key, value]) => {
      const section = String(key).split('.')[0];
      stmt.run(section, key, value == null ? '' : String(value));
    });
    stmt.finalize((err) => {
      if (err) {
        console.error('Erro ao salvar conteúdo:', err);
        return res.status(500).json({ error: 'Erro ao salvar conteúdo' });
      }
      res.json({ message: 'Conteúdo atualizado' });
    });
  });
});

router.put('/settings', (req, res) => {
  const updates = req.body || {};
  const entries = Object.entries(updates);
  if (entries.length === 0) return res.json({ message: 'Nada para atualizar' });

  db.serialize(() => {
    const stmt = db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)');
    entries.forEach(([key, value]) => {
      stmt.run(key, value == null ? '' : String(value));
    });
    stmt.finalize((err) => {
      if (err) {
        console.error('Erro ao salvar configurações:', err);
        return res.status(500).json({ error: 'Erro ao salvar configurações' });
      }
      res.json({ message: 'Configurações atualizadas' });
    });
  });
});

router.get('/all-data', async (req, res) => {
  try {
    const [
      settings_rows, content_rows, solutions_rows,
      segments, stats, banners,
      client_logos, testimonials, partners,
    ] = await Promise.all([
      queryAll('SELECT * FROM site_settings'),
      queryAll('SELECT * FROM site_content'),
      queryAll('SELECT * FROM solutions ORDER BY order_num'),
      queryAll('SELECT * FROM segments ORDER BY order_num'),
      queryAll('SELECT * FROM stats ORDER BY order_num'),
      queryAll('SELECT * FROM banners ORDER BY page, order_num'),
      queryAll('SELECT * FROM client_logos ORDER BY order_num'),
      queryAll('SELECT * FROM testimonials ORDER BY order_num'),
      queryAll('SELECT * FROM partners ORDER BY order_num'),
    ]);

    const settings = {};
    settings_rows.forEach(r => { settings[r.key] = r.value; });

    const content = {};
    content_rows.forEach(r => { content[r.key] = r.value; });

    const solutions = solutions_rows.map(r => {
      try { return { ...r, features: JSON.parse(r.features || '[]') }; }
      catch { return { ...r, features: [] }; }
    });

    res.json({ settings, content, solutions, segments, stats, banners, client_logos, testimonials, partners });
  } catch (err) {
    console.error('all-data error:', err);
    res.status(500).json({ error: 'Erro ao buscar dados' });
  }
});

module.exports = router;
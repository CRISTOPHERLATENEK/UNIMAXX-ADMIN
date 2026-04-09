// Client logos, testimonials, partners
const router = require('express').Router();
const { db } = require('../../db/database');

// ── Client Logos ──────────────────────────────────────────────────────────
router.get('/client-logos', (req, res) => {
  db.all('SELECT * FROM client_logos ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});
router.post('/client-logos', (req, res) => {
  const { name, image, url, order_num, active } = req.body;
  db.run('INSERT INTO client_logos (name,image,url,order_num,active) VALUES (?,?,?,?,?)',
    [name, image, url||'', order_num||0, active??1],
    function(err) { err ? res.status(500).json({ error: 'Erro' }) : res.json({ id: this.lastID }); }
  );
});
router.put('/client-logos/:id', (req, res) => {
  const { name, image, url, order_num, active } = req.body;
  db.run('UPDATE client_logos SET name=?,image=?,url=?,order_num=?,active=? WHERE id=?',
    [name, image, url||'', order_num||0, active, req.params.id],
    (err) => { err ? res.status(500).json({ error: 'Erro' }) : res.json({ ok: true }); }
  );
});
router.delete('/client-logos/:id', (req, res) => {
  db.run('DELETE FROM client_logos WHERE id=?', [req.params.id],
    (err) => { err ? res.status(500).json({ error: 'Erro' }) : res.json({ ok: true }); }
  );
});

// ── Testimonials ──────────────────────────────────────────────────────────
router.get('/testimonials', (req, res) => {
  db.all('SELECT * FROM testimonials ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});
router.post('/testimonials', (req, res) => {
  const { author_name, author_role, author_company, author_photo, content, rating, order_num, active } = req.body;
  db.run('INSERT INTO testimonials (author_name,author_role,author_company,author_photo,content,rating,order_num,active) VALUES (?,?,?,?,?,?,?,?)',
    [author_name, author_role||'', author_company||'', author_photo||'', content, rating||5, order_num||0, active??1],
    function(err) { err ? res.status(500).json({ error: 'Erro' }) : res.json({ id: this.lastID }); }
  );
});
router.put('/testimonials/:id', (req, res) => {
  const { author_name, author_role, author_company, author_photo, content, rating, order_num, active } = req.body;
  db.run('UPDATE testimonials SET author_name=?,author_role=?,author_company=?,author_photo=?,content=?,rating=?,order_num=?,active=? WHERE id=?',
    [author_name, author_role||'', author_company||'', author_photo||'', content, rating||5, order_num||0, active, req.params.id],
    (err) => { err ? res.status(500).json({ error: 'Erro' }) : res.json({ ok: true }); }
  );
});
router.delete('/testimonials/:id', (req, res) => {
  db.run('DELETE FROM testimonials WHERE id=?', [req.params.id],
    (err) => { err ? res.status(500).json({ error: 'Erro' }) : res.json({ ok: true }); }
  );
});

// ── Partners ──────────────────────────────────────────────────────────────
router.get('/partners', (req, res) => {
  db.all('SELECT * FROM partners ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});
router.post('/partners', (req, res) => {
  const { name, image, url, category, order_num, active } = req.body;
  db.run('INSERT INTO partners (name,image,url,category,order_num,active) VALUES (?,?,?,?,?,?)',
    [name, image, url||'', category||'parceiro', order_num||0, active??1],
    function(err) { err ? res.status(500).json({ error: 'Erro' }) : res.json({ id: this.lastID }); }
  );
});
router.put('/partners/:id', (req, res) => {
  const { name, image, url, category, order_num, active } = req.body;
  db.run('UPDATE partners SET name=?,image=?,url=?,category=?,order_num=?,active=? WHERE id=?',
    [name, image, url||'', category||'parceiro', order_num||0, active, req.params.id],
    (err) => { err ? res.status(500).json({ error: 'Erro' }) : res.json({ ok: true }); }
  );
});
router.delete('/partners/:id', (req, res) => {
  db.run('DELETE FROM partners WHERE id=?', [req.params.id],
    (err) => { err ? res.status(500).json({ error: 'Erro' }) : res.json({ ok: true }); }
  );
});

module.exports = router;

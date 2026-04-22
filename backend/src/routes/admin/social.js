const router = require('express').Router();
const { db } = require('../../db/database');
const { validateBody, validateParams } = require('../../middleware/validate');
const { clientLogoSchema, testimonialSchema, partnerSchema, numericIdParamSchema } = require('../../validation/admin');
const { logAudit } = require('../../utils/audit');

// ── Client Logos ──────────────────────────────────────────────────────────
router.get('/client-logos', (req, res) => {
  db.all('SELECT * FROM client_logos ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});
router.post('/client-logos', validateBody(clientLogoSchema), (req, res) => {
  const payload = req.validatedBody;
  db.run('INSERT INTO client_logos (name,image,url,order_num,active) VALUES (?,?,?,?,?)',
    [payload.name, payload.image, payload.url || '', payload.order_num, payload.active],
    async function (err) {
      if (err) return res.status(500).json({ error: 'Erro' });
      await logAudit(req, { userId: req.user?.id, action: 'create_client_logo', entity: 'client_logos', entityId: this.lastID, details: { name: payload.name } });
      res.json({ id: this.lastID });
    }
  );
});
router.put('/client-logos/:id', validateParams(numericIdParamSchema), validateBody(clientLogoSchema), (req, res) => {
  const payload = req.validatedBody;
  db.run('UPDATE client_logos SET name=?,image=?,url=?,order_num=?,active=? WHERE id=?',
    [payload.name, payload.image, payload.url || '', payload.order_num, payload.active, req.validatedParams.id],
    async function (err) {
      if (err) return res.status(500).json({ error: 'Erro' });
      if (this.changes === 0) return res.status(404).json({ error: 'Logo não encontrado' });
      await logAudit(req, { userId: req.user?.id, action: 'update_client_logo', entity: 'client_logos', entityId: req.validatedParams.id, details: { name: payload.name } });
      res.json({ ok: true });
    }
  );
});
router.delete('/client-logos/:id', validateParams(numericIdParamSchema), (req, res) => {
  db.run('DELETE FROM client_logos WHERE id=?', [req.validatedParams.id], async function (err) {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (this.changes === 0) return res.status(404).json({ error: 'Logo não encontrado' });
    await logAudit(req, { userId: req.user?.id, action: 'delete_client_logo', entity: 'client_logos', entityId: req.validatedParams.id });
    res.json({ ok: true });
  });
});

// ── Testimonials ──────────────────────────────────────────────────────────
router.get('/testimonials', (req, res) => {
  db.all('SELECT * FROM testimonials ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});
router.post('/testimonials', validateBody(testimonialSchema), (req, res) => {
  const payload = req.validatedBody;
  db.run('INSERT INTO testimonials (author_name,author_role,author_company,author_photo,content,rating,order_num,active) VALUES (?,?,?,?,?,?,?,?)',
    [payload.author_name, payload.author_role || '', payload.author_company || '', payload.author_photo || '', payload.content, payload.rating, payload.order_num, payload.active],
    async function (err) {
      if (err) return res.status(500).json({ error: 'Erro' });
      await logAudit(req, { userId: req.user?.id, action: 'create_testimonial', entity: 'testimonials', entityId: this.lastID, details: { author: payload.author_name } });
      res.json({ id: this.lastID });
    }
  );
});
router.put('/testimonials/:id', validateParams(numericIdParamSchema), validateBody(testimonialSchema), (req, res) => {
  const payload = req.validatedBody;
  db.run('UPDATE testimonials SET author_name=?,author_role=?,author_company=?,author_photo=?,content=?,rating=?,order_num=?,active=? WHERE id=?',
    [payload.author_name, payload.author_role || '', payload.author_company || '', payload.author_photo || '', payload.content, payload.rating, payload.order_num, payload.active, req.validatedParams.id],
    async function (err) {
      if (err) return res.status(500).json({ error: 'Erro' });
      if (this.changes === 0) return res.status(404).json({ error: 'Depoimento não encontrado' });
      await logAudit(req, { userId: req.user?.id, action: 'update_testimonial', entity: 'testimonials', entityId: req.validatedParams.id, details: { author: payload.author_name } });
      res.json({ ok: true });
    }
  );
});
router.delete('/testimonials/:id', validateParams(numericIdParamSchema), (req, res) => {
  db.run('DELETE FROM testimonials WHERE id=?', [req.validatedParams.id], async function (err) {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (this.changes === 0) return res.status(404).json({ error: 'Depoimento não encontrado' });
    await logAudit(req, { userId: req.user?.id, action: 'delete_testimonial', entity: 'testimonials', entityId: req.validatedParams.id });
    res.json({ ok: true });
  });
});

// ── Partners ──────────────────────────────────────────────────────────────
router.get('/partners', (req, res) => {
  db.all('SELECT * FROM partners ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});
router.post('/partners', validateBody(partnerSchema), (req, res) => {
  const payload = req.validatedBody;
  db.run('INSERT INTO partners (name,image,url,category,order_num,active) VALUES (?,?,?,?,?,?)',
    [payload.name, payload.image, payload.url || '', payload.category || 'parceiro', payload.order_num, payload.active],
    async function (err) {
      if (err) return res.status(500).json({ error: 'Erro' });
      await logAudit(req, { userId: req.user?.id, action: 'create_partner', entity: 'partners', entityId: this.lastID, details: { name: payload.name } });
      res.json({ id: this.lastID });
    }
  );
});
router.put('/partners/:id', validateParams(numericIdParamSchema), validateBody(partnerSchema), (req, res) => {
  const payload = req.validatedBody;
  db.run('UPDATE partners SET name=?,image=?,url=?,category=?,order_num=?,active=? WHERE id=?',
    [payload.name, payload.image, payload.url || '', payload.category || 'parceiro', payload.order_num, payload.active, req.validatedParams.id],
    async function (err) {
      if (err) return res.status(500).json({ error: 'Erro' });
      if (this.changes === 0) return res.status(404).json({ error: 'Parceiro não encontrado' });
      await logAudit(req, { userId: req.user?.id, action: 'update_partner', entity: 'partners', entityId: req.validatedParams.id, details: { name: payload.name } });
      res.json({ ok: true });
    }
  );
});
router.delete('/partners/:id', validateParams(numericIdParamSchema), (req, res) => {
  db.run('DELETE FROM partners WHERE id=?', [req.validatedParams.id], async function (err) {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (this.changes === 0) return res.status(404).json({ error: 'Parceiro não encontrado' });
    await logAudit(req, { userId: req.user?.id, action: 'delete_partner', entity: 'partners', entityId: req.validatedParams.id });
    res.json({ ok: true });
  });
});

module.exports = router;

const router = require('express').Router();
const { db } = require('../../db/database');
const { validateBody, validateParams } = require('../../middleware/validate');
const { idParamSchema, segmentSchema } = require('../../validation/admin');
const { logAudit } = require('../../utils/audit');
const fs = require('fs');
const path = require('path');
const { UPLOAD_DIR } = require('../../config/env');

function makeSegmentId(inputName) {
  const normalized = String(inputName || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return normalized || `segment-${Date.now()}`;
}

router.get('/', (req, res) => {
  db.all('SELECT * FROM segments ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});

router.post('/', validateBody(segmentSchema), (req, res) => {
  const payload = req.validatedBody;
  const segmentId = payload.segment_id || makeSegmentId(payload.name);

  db.run(
    `INSERT INTO segments (segment_id,name,icon,order_num,active,image,description,show_home) VALUES (?,?,?,?,?,?,?,?)`,
    [segmentId, payload.name, payload.icon || 'Shirt', payload.order_num, payload.active, payload.image || '', payload.description || '', payload.show_home],
    async function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) return res.status(409).json({ error: 'Identificador do segmento já existe' });
        return res.status(500).json({ error: 'Erro ao criar' });
      }
      await logAudit(req, { userId: req.user?.id, action: 'create_segment', entity: 'segments', entityId: segmentId, details: { name: payload.name } });
      res.json({ message: 'Criado' });
    }
  );
});

router.put('/:id', validateParams(idParamSchema), validateBody(segmentSchema.omit({ segment_id: true })), (req, res) => {
  const payload = req.validatedBody;
  db.run(
    `UPDATE segments SET name=?,icon=?,order_num=?,active=?,image=?,description=?,show_home=? WHERE segment_id=?`,
    [payload.name, payload.icon, payload.order_num, payload.active, payload.image || '', payload.description || '', payload.show_home, req.validatedParams.id],
    async function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar' });
      if (this.changes === 0) return res.status(404).json({ error: 'Segmento não encontrado' });
      await logAudit(req, { userId: req.user?.id, action: 'update_segment', entity: 'segments', entityId: req.validatedParams.id, details: { name: payload.name } });
      res.json({ message: 'Atualizado' });
    }
  );
});

router.delete('/:id', validateParams(idParamSchema), (req, res) => {
  const { id } = req.validatedParams;
  
  db.get('SELECT image FROM segments WHERE segment_id=?', [id], (err, row) => {
    if (err || !row) return res.status(404).json({ error: 'Segmento não encontrado' });
    const imagePath = row.image;
    
    db.run('DELETE FROM segments WHERE segment_id=?', [id], async function (err2) {
      if (err2) return res.status(500).json({ error: 'Erro' });
      if (this.changes > 0 && imagePath) {
        const fullPath = path.join(UPLOAD_DIR, path.basename(imagePath));
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      }
      await logAudit(req, { userId: req.user?.id, action: 'delete_segment', entity: 'segments', entityId: id });
      res.json({ message: 'Excluído' });
    });
  });
});

module.exports = router;

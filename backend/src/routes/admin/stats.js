const router = require('express').Router();
const { db } = require('../../db/database');
const { validateBody, validateParams } = require('../../middleware/validate');
const { idParamSchema, statSchema, statUpdateSchema } = require('../../validation/admin');
const { logAudit } = require('../../utils/audit');

router.post('/', validateBody(statSchema), (req, res) => {
  const payload = req.validatedBody;
  db.run('INSERT INTO stats (value,label,stat_id,section,order_num) VALUES (?,?,?,?,?)',
    [payload.value, payload.label, payload.stat_id, payload.section || 'numbers', payload.order_num],
    async function (err) {
      if (err) return res.status(500).json({ error: 'Erro' });
      await logAudit(req, { userId: req.user?.id, action: 'create_stat', entity: 'stats', entityId: payload.stat_id, details: { label: payload.label } });
      res.json({ message: 'Criado', id: this.lastID });
    }
  );
});

router.put('/:id', validateParams(idParamSchema), validateBody(statUpdateSchema), (req, res) => {
  const payload = req.validatedBody;
  db.run('UPDATE stats SET value=?,label=?,order_num=? WHERE stat_id=?',
    [payload.value, payload.label, payload.order_num, req.validatedParams.id],
    async function (err) {
      if (err) return res.status(500).json({ error: 'Erro' });
      if (this.changes === 0) return res.status(404).json({ error: 'Estatística não encontrada' });
      await logAudit(req, { userId: req.user?.id, action: 'update_stat', entity: 'stats', entityId: req.validatedParams.id, details: { label: payload.label } });
      res.json({ message: 'Atualizado' });
    }
  );
});

router.delete('/:id', validateParams(idParamSchema), (req, res) => {
  db.run('DELETE FROM stats WHERE stat_id=?', [req.validatedParams.id], async function (err) {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (this.changes === 0) return res.status(404).json({ error: 'Estatística não encontrada' });
    await logAudit(req, { userId: req.user?.id, action: 'delete_stat', entity: 'stats', entityId: req.validatedParams.id });
    res.json({ message: 'Excluído' });
  });
});

module.exports = router;

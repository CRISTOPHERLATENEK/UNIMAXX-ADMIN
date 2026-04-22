const router = require('express').Router();
const { db, parseArr } = require('../../db/database');
const { validateBody, validateParams } = require('../../middleware/validate');
const { idParamSchema, solutionSchema } = require('../../validation/admin');
const { logAudit } = require('../../utils/audit');

router.get('/', (req, res) => {
  db.all('SELECT * FROM solutions ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json((rows || []).map(r => ({ ...r, features: parseArr(r.features) })));
  });
});

router.put('/:id', validateParams(idParamSchema), validateBody(solutionSchema), (req, res) => {
  const { id } = req.validatedParams;
  const payload = req.validatedBody;
  const values = {
    ...payload,
    features: JSON.stringify(payload.features || []),
  };

  db.get('SELECT 1 FROM solutions WHERE solution_id=?', [id], (err, exists) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (!exists) {
      db.run(
        `INSERT INTO solutions (solution_id,title,description,features,cta_text,icon,image,order_num,active,nav_link)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [id, payload.title, payload.description, values.features, payload.cta_text, payload.icon, payload.image, payload.order_num, payload.active, payload.nav_link || null],
        async (e) => {
          if (e) return res.status(500).json({ error: 'Erro ao criar' });
          await logAudit(req, { userId: req.user?.id, action: 'create_solution', entity: 'solutions', entityId: id, details: { title: payload.title } });
          res.json({ message: 'Criado' });
        }
      );
    } else {
      db.run(
        `UPDATE solutions SET title=?,description=?,features=?,cta_text=?,icon=?,image=?,order_num=?,active=?,nav_link=?
         WHERE solution_id=?`,
        [payload.title, payload.description, values.features, payload.cta_text, payload.icon, payload.image, payload.order_num, payload.active, payload.nav_link || null, id],
        async (e) => {
          if (e) return res.status(500).json({ error: 'Erro ao atualizar' });
          await logAudit(req, { userId: req.user?.id, action: 'update_solution', entity: 'solutions', entityId: id, details: { title: payload.title } });
          res.json({ message: 'Atualizado' });
        }
      );
    }
  });
});

router.delete('/:id', validateParams(idParamSchema), (req, res) => {
  const { id } = req.validatedParams;
  db.run('DELETE FROM solutions WHERE solution_id=?', [id], async function (err) {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (this.changes === 0) return res.status(404).json({ error: 'Não encontrado' });
    await logAudit(req, { userId: req.user?.id, action: 'delete_solution', entity: 'solutions', entityId: id });
    res.json({ message: 'Excluído' });
  });
});

module.exports = router;

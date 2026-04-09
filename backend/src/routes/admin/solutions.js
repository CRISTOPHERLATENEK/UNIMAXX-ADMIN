const router = require('express').Router();
const { db, parseArr } = require('../../db/database');

router.get('/', (req, res) => {
  db.all('SELECT * FROM solutions ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json((rows || []).map(r => ({ ...r, features: parseArr(r.features) })));
  });
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const b = req.body || {};
  const title = b.title || '', description = b.description || '';
  if (!title) return res.status(400).json({ error: 'title é obrigatório' });

  const vals = {
    cta_text: b.cta_text || 'Saiba mais', icon: b.icon || 'Building2', image: b.image || '',
    order_num: Number(b.order_num || 0), active: b.active === 0 || b.active === false ? 0 : 1,
    nav_link: b.nav_link || null,
    features: JSON.stringify(Array.isArray(b.features) ? b.features : []),
  };

  db.get('SELECT 1 FROM solutions WHERE solution_id=?', [id], (err, exists) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (!exists) {
      db.run(
        `INSERT INTO solutions (solution_id,title,description,features,cta_text,icon,image,order_num,active,nav_link)
         VALUES (?,?,?,?,?,?,?,?,?,?)`,
        [id, title, description, vals.features, vals.cta_text, vals.icon, vals.image, vals.order_num, vals.active, vals.nav_link],
        (e) => e ? res.status(500).json({ error: 'Erro ao criar' }) : res.json({ message: 'Criado' })
      );
    } else {
      db.run(
        `UPDATE solutions SET title=?,description=?,features=?,cta_text=?,icon=?,image=?,order_num=?,active=?,nav_link=?
         WHERE solution_id=?`,
        [title, description, vals.features, vals.cta_text, vals.icon, vals.image, vals.order_num, vals.active, vals.nav_link, id],
        (e) => e ? res.status(500).json({ error: 'Erro ao atualizar' }) : res.json({ message: 'Atualizado' })
      );
    }
  });
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM solutions WHERE solution_id=?', [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: 'Erro' });
    if (this.changes === 0) return res.status(404).json({ error: 'Não encontrado' });
    res.json({ message: 'Excluído' });
  });
});

module.exports = router;

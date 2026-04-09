const router = require('express').Router();
const { db } = require('../../db/database');

router.get('/', (req, res) => {
  db.all('SELECT * FROM segments ORDER BY order_num', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json(rows || []);
  });
});

router.post('/', (req, res) => {
  const { segment_id, name, icon, order_num, active, image, description, show_home } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
  db.run(
    `INSERT INTO segments (segment_id,name,icon,order_num,active,image,description,show_home) VALUES (?,?,?,?,?,?,?,?)`,
    [segment_id, name, icon||'Shirt', order_num||0, active??1, image||'', description||'', show_home??1],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erro ao criar' });
      res.json({ message: 'Criado' });
    }
  );
});

router.put('/:id', (req, res) => {
  const { name, icon, order_num, active, image, description, show_home } = req.body || {};
  db.run(
    `UPDATE segments SET name=?,icon=?,order_num=?,active=?,image=?,description=?,show_home=? WHERE segment_id=?`,
    [name, icon, order_num, active, image??'', description??'', show_home??1, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro ao atualizar' });
      res.json({ message: 'Atualizado' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM segments WHERE segment_id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json({ message: 'Excluído' });
  });
});

module.exports = router;

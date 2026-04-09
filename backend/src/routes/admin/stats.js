const router = require('express').Router();
const { db } = require('../../db/database');

router.post('/', (req, res) => {
  const { value, label, stat_id, section, order_num } = req.body || {};
  db.run('INSERT INTO stats (value,label,stat_id,section,order_num) VALUES (?,?,?,?,?)',
    [value, label, stat_id, section||'numbers', order_num||0],
    function(err) {
      if (err) return res.status(500).json({ error: 'Erro' });
      res.json({ message: 'Criado', id: this.lastID });
    }
  );
});

router.put('/:id', (req, res) => {
  const { value, label, order_num } = req.body || {};
  db.run('UPDATE stats SET value=?,label=?,order_num=? WHERE stat_id=?',
    [value, label, order_num, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: 'Erro' });
      res.json({ message: 'Atualizado' });
    }
  );
});

router.delete('/:id', (req, res) => {
  db.run('DELETE FROM stats WHERE stat_id=?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: 'Erro' });
    res.json({ message: 'Excluído' });
  });
});

module.exports = router;

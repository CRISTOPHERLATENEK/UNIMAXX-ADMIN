const router = require('express').Router();
const { db } = require('../../db/database');

// Helper: run query returning promise
const q = (sql, params = []) => new Promise((res, rej) =>
  db.all(sql, params, (err, rows) => err ? rej(err) : res(rows || []))
);
const qGet = (sql, params = []) => new Promise((res, rej) =>
  db.get(sql, params, (err, row) => err ? rej(err) : res(row || {}))
);

// ── GET /admin/analytics ───────────────────────────────────────────────────
// Retorna todas as métricas para o dashboard
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    // Datas úteis
    const d7  = new Date(now - 7  * 86400000).toISOString();
    const d30 = new Date(now - 30 * 86400000).toISOString();
    const d60 = new Date(now - 60 * 86400000).toISOString();

    // ── Totais ──────────────────────────────────────────────────────────
    const [total7, total30, totalAll] = await Promise.all([
      qGet('SELECT COUNT(*) as n FROM pageviews WHERE created_at >= ?', [d7]),
      qGet('SELECT COUNT(*) as n FROM pageviews WHERE created_at >= ?', [d30]),
      qGet('SELECT COUNT(*) as n FROM pageviews', []),
    ]);

    // ── Visitantes únicos (por session_id) ──────────────────────────────
    const [uniq7, uniq30] = await Promise.all([
      qGet('SELECT COUNT(DISTINCT session_id) as n FROM pageviews WHERE created_at >= ? AND session_id != \'\'', [d7]),
      qGet('SELECT COUNT(DISTINCT session_id) as n FROM pageviews WHERE created_at >= ? AND session_id != \'\'', [d30]),
    ]);

    // ── Páginas mais acessadas (30d) ─────────────────────────────────────
    const topPages = await q(
      `SELECT page, COUNT(*) as views FROM pageviews
       WHERE created_at >= ? GROUP BY page ORDER BY views DESC LIMIT 8`,
      [d30]
    );

    // ── Visitas por dia — últimos 14 dias ────────────────────────────────
    const daily = await q(
      `SELECT DATE(created_at) as day, COUNT(*) as views,
              COUNT(DISTINCT session_id) as visitors
       FROM pageviews WHERE created_at >= ?
       GROUP BY DATE(created_at) ORDER BY day ASC`,
      [new Date(now - 14 * 86400000).toISOString()]
    );

    // ── Comparativo 0-30d vs 31-60d ──────────────────────────────────────
    const [prev30] = await Promise.all([
      qGet('SELECT COUNT(*) as n FROM pageviews WHERE created_at >= ? AND created_at < ?', [d60, d30]),
    ]);

    const growthViews = prev30.n > 0
      ? Math.round(((total30.n - prev30.n) / prev30.n) * 100)
      : (total30.n > 0 ? 100 : 0);

    // ── Hoje vs ontem ────────────────────────────────────────────────────
    const [today, yesterday] = await Promise.all([
      qGet(`SELECT COUNT(*) as n FROM pageviews WHERE DATE(created_at) = DATE('now','localtime')`, []),
      qGet(`SELECT COUNT(*) as n FROM pageviews WHERE DATE(created_at) = DATE('now','-1 day','localtime')`, []),
    ]);

    // ── Fontes de tráfego (referrer) ────────────────────────────────────
    const sources = await q(
      `SELECT
        CASE
          WHEN referrer = '' OR referrer IS NULL THEN 'Direto'
          WHEN referrer LIKE '%google%' THEN 'Google'
          WHEN referrer LIKE '%facebook%' OR referrer LIKE '%instagram%' THEN 'Redes Sociais'
          WHEN referrer LIKE '%whatsapp%' THEN 'WhatsApp'
          ELSE 'Outros'
        END as source,
        COUNT(*) as views
       FROM pageviews WHERE created_at >= ?
       GROUP BY source ORDER BY views DESC`,
      [d30]
    );

    res.json({
      summary: {
        views7:   total7.n,
        views30:  total30.n,
        viewsAll: totalAll.n,
        uniq7:    uniq7.n,
        uniq30:   uniq30.n,
        today:    today.n,
        yesterday: yesterday.n,
        growthViews,
      },
      topPages,
      daily,
      sources,
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Erro ao buscar analytics' });
  }
});

module.exports = router;

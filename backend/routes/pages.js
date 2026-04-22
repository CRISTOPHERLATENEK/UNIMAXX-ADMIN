const express = require('express');
const router = express.Router();
const { db } = require('../database');

// Páginas públicas
router.get('/', async (req, res) => {
    try {
        const pages = await db.all(
            'SELECT id, slug, title, is_published, updated_at FROM pages WHERE is_published = 1'
        );
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const page = await db.get(
            'SELECT * FROM pages WHERE slug = ? AND is_published = 1',
            [req.params.slug]
        );

        if (!page) {
            return res.status(404).json({ error: 'Página não encontrada' });
        }

        page.layout_json = JSON.parse(page.layout_json || '[]');
        res.json(page);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Sitemap.xml
router.get('/sitemap/xml', async (req, res) => {
    try {
        const pages = await db.all(
            'SELECT slug, updated_at FROM pages WHERE is_published = 1'
        );

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        for (const page of pages) {
            xml += '  <url>\n';
            xml += `    <loc>https://seusite.com/${page.slug}</loc>\n`;
            xml += `    <lastmod>${page.updated_at.split('T')[0]}</lastmod>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '  </url>\n';
        }

        xml += '</urlset>';

        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Robots.txt
router.get('/robots/txt', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(`User-agent: *
Allow: /
Sitemap: https://seusite.com/api/pages/sitemap/xml
`);
});

module.exports = router;

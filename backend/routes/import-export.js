const express = require('express');
const router = express.Router();
const { db } = require('../database');
const authenticate = require('../middleware/auth');
const JSZip = require('jszip');

/**
 * Exportar todos os dados do site
 */
router.get('/export/full', authenticate, async (req, res) => {
    try {
        const data = {
            exportDate: new Date().toISOString(),
            version: '2.0.0',
            pages: await db.all('SELECT * FROM pages'),
            components: await db.all('SELECT * FROM components'),
            menus: await db.all('SELECT * FROM menus'),
            forms: await db.all('SELECT * FROM forms'),
            media: await db.all('SELECT * FROM media'),
            theme: await db.get('SELECT * FROM theme_settings WHERE id = 1')
        };

        // Criar ZIP com dados e arquivos
        const zip = new JSZip();
        zip.file('data.json', JSON.stringify(data, null, 2));

        // Adicionar arquivos de mídia
        const fs = require('fs');
        const path = require('path');
        const mediaFolder = zip.folder('media');

        for (const file of data.media) {
            const filePath = path.join(__dirname, '..', file.url);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath);
                mediaFolder.file(file.filename, content);
            }
        }

        const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', 'attachment; filename=unimaxx-backup.zip');
        res.send(zipContent);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Importar dados
 */
router.post('/import', authenticate, async (req, res) => {
    try {
        const { data } = req.body;

        // Validação básica
        if (!data || !data.version) {
            return res.status(400).json({ error: 'Dados inválidos' });
        }

        // Importar páginas
        if (data.pages) {
            for (const page of data.pages) {
                await db.run(
                    `INSERT OR REPLACE INTO pages (id, slug, title, meta_description, layout_json, is_published) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [page.id, page.slug, page.title, page.meta_description, 
                     JSON.stringify(page.layout_json), page.is_published]
                );
            }
        }

        // Importar tema
        if (data.theme) {
            await db.run(
                `UPDATE theme_settings SET 
                    primary_color = ?, secondary_color = ?, font_family = ?,
                    border_radius = ?, max_width = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = 1`,
                [data.theme.primary_color, data.theme.secondary_color, 
                 data.theme.font_family, data.theme.border_radius, data.theme.max_width]
            );
        }

        // Importar menus
        if (data.menus) {
            for (const menu of data.menus) {
                await db.run(
                    `INSERT OR REPLACE INTO menus (id, name, location, items_json) 
                     VALUES (?, ?, ?, ?)`,
                    [menu.id, menu.name, menu.location, JSON.stringify(menu.items_json)]
                );
            }
        }

        res.json({ success: true, message: 'Dados importados com sucesso' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Exportar apenas páginas
 */
router.get('/export/pages', authenticate, async (req, res) => {
    try {
        const pages = await db.all('SELECT * FROM pages');
        res.set('Content-Type', 'application/json');
        res.set('Content-Disposition', 'attachment; filename=pages-export.json');
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Exportar apenas tema
 */
router.get('/export/theme', authenticate, async (req, res) => {
    try {
        const theme = await db.get('SELECT * FROM theme_settings WHERE id = 1');
        res.set('Content-Type', 'application/json');
        res.set('Content-Disposition', 'attachment; filename=theme-export.json');
        res.json(theme);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

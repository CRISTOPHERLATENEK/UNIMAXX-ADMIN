const express = require('express');
const router = express.Router();
const { db } = require('../database');
const authenticate = require('../middleware/auth');
const { auditLogger } = require('../middleware/audit');

// Aplicar audit logger em todas as rotas
router.use(auditLogger);

// ==================== TEMA ====================
router.get('/theme', async (req, res) => {
    try {
        const theme = await db.get('SELECT * FROM theme_settings WHERE id = 1');
        res.json(theme);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/theme', authenticate, async (req, res) => {
    try {
        const {
            primary_color, secondary_color, accent_color,
            font_family, border_radius, max_width, custom_css
        } = req.body;

        await db.run(`
            UPDATE theme_settings SET 
                primary_color = COALESCE(?, primary_color),
                secondary_color = COALESCE(?, secondary_color),
                accent_color = COALESCE(?, accent_color),
                font_family = COALESCE(?, font_family),
                border_radius = COALESCE(?, border_radius),
                max_width = COALESCE(?, max_width),
                custom_css = COALESCE(?, custom_css),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = 1
        `, [primary_color, secondary_color, accent_color, font_family, 
            border_radius, max_width, custom_css]);

        res.json({ success: true, message: 'Tema atualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== PÁGINAS ====================
router.get('/pages', async (req, res) => {
    try {
        const pages = await db.all(`
            SELECT id, slug, title, is_published, is_homepage, 
                   created_at, updated_at 
            FROM pages ORDER BY updated_at DESC
        `);
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/pages/:id', async (req, res) => {
    try {
        const page = await db.get('SELECT * FROM pages WHERE id = ?', [req.params.id]);
        if (!page) return res.status(404).json({ error: 'Página não encontrada' });

        page.layout_json = JSON.parse(page.layout_json || '[]');
        res.json(page);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/pages', authenticate, async (req, res) => {
    try {
        const { slug, title, meta_description, layout_json } = req.body;

        const result = await db.run(
            `INSERT INTO pages (slug, title, meta_description, layout_json, created_by) 
             VALUES (?, ?, ?, ?, ?)`,
            [slug, title, meta_description, JSON.stringify(layout_json), req.user.id]
        );

        res.status(201).json({ id: result.lastID, message: 'Página criada' });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Slug já existe' });
        }
        res.status(500).json({ error: error.message });
    }
});

router.put('/pages/:id', authenticate, async (req, res) => {
    try {
        const { slug, title, meta_description, layout_json, meta_title } = req.body;

        await db.run(`
            UPDATE pages SET 
                slug = ?, title = ?, meta_title = ?, meta_description = ?, 
                layout_json = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [slug, title, meta_title, meta_description, 
            JSON.stringify(layout_json), req.user.id, req.params.id]);

        res.json({ success: true, message: 'Página atualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/pages/:id/publish', authenticate, async (req, res) => {
    try {
        const { is_published } = req.body;
        const published_at = is_published ? new Date().toISOString() : null;

        await db.run(
            'UPDATE pages SET is_published = ?, published_at = ? WHERE id = ?',
            [is_published, published_at, req.params.id]
        );

        res.json({ 
            success: true, 
            message: is_published ? 'Página publicada' : 'Página despublicada' 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/pages/:id', authenticate, async (req, res) => {
    try {
        await db.run('DELETE FROM pages WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Página excluída' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== COMPONENTES ====================
router.get('/components', async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM components WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY order_index';
        const components = await db.all(query, params);

        res.json(components.map(c => ({
            ...c,
            content_json: JSON.parse(c.content_json),
            styles_json: JSON.parse(c.styles_json || '{}')
        })));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/components', authenticate, async (req, res) => {
    try {
        const { name, type, description, content_json, category } = req.body;

        const result = await db.run(
            `INSERT INTO components (name, type, description, content_json, category, created_by) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, type, description, JSON.stringify(content_json), category, req.user.id]
        );

        res.status(201).json({ id: result.lastID });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== MENUS ====================
router.get('/menus/:location', async (req, res) => {
    try {
        const menu = await db.get('SELECT * FROM menus WHERE location = ?', [req.params.location]);
        res.json(menu ? JSON.parse(menu.items_json) : []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/menus/:location', authenticate, async (req, res) => {
    try {
        const { items } = req.body;
        const exists = await db.get('SELECT id FROM menus WHERE location = ?', [req.params.location]);

        if (exists) {
            await db.run(
                'UPDATE menus SET items_json = ?, updated_at = CURRENT_TIMESTAMP WHERE location = ?',
                [JSON.stringify(items), req.params.location]
            );
        } else {
            await db.run(
                'INSERT INTO menus (name, location, items_json) VALUES (?, ?, ?)',
                [req.params.location, req.params.location, JSON.stringify(items)]
            );
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== FORMULÁRIOS ====================
router.get('/forms', async (req, res) => {
    try {
        const forms = await db.all('SELECT id, name, slug, is_active FROM forms');
        res.json(forms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/forms/:id/submit', async (req, res) => {
    try {
        const { id } = req.params;
        const form = await db.get('SELECT * FROM forms WHERE id = ? AND is_active = 1', [id]);

        if (!form) return res.status(404).json({ error: 'Formulário não encontrado' });

        // Validar campos obrigatórios
        const fields = JSON.parse(form.fields_json);
        const data = req.body;

        for (const field of fields) {
            if (field.required && !data[field.name]) {
                return res.status(400).json({ error: `Campo ${field.label} é obrigatório` });
            }
        }

        // Salvar submission
        await db.run(
            `INSERT INTO form_submissions (form_id, data_json, ip_address, user_agent) 
             VALUES (?, ?, ?, ?)`,
            [id, JSON.stringify(data), req.ip, req.get('user-agent')]
        );

        // TODO: Enviar email de notificação

        res.json({ success: true, message: form.success_message });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== ESTATÍSTICAS/ANALYTICS ====================
router.get('/analytics', authenticate, async (req, res) => {
    try {
        const stats = await db.get(`
            SELECT 
                (SELECT COUNT(*) FROM pages WHERE is_published = 1) as published_pages,
                (SELECT COUNT(*) FROM media) as total_media,
                (SELECT COUNT(*) FROM form_submissions WHERE created_at > date('now', '-30 days')) as submissions_month,
                (SELECT COUNT(*) FROM audit_log WHERE created_at > date('now', '-7 days')) as activity_week
        `);

        const recentActivity = await db.all(`
            SELECT a.*, u.name as user_name 
            FROM audit_log a 
            LEFT JOIN users u ON a.user_id = u.id 
            ORDER BY a.created_at DESC LIMIT 20
        `);

        res.json({ stats, recentActivity });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;

const { z } = require('zod');
const { validateBody, validateParams } = require('../../middleware/validate');
const { helpArticleSchema, helpArticleUpdateSchema, helpCategorySchema, helpImageSchema } = require('../../validation/admin');
const { logAudit } = require('../../utils/audit');
const { MAX_UPLOAD_SIZE } = require('../../config/env');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

module.exports = function (app, db, authenticateToken, upload) {
  const idParamSchema = z.object({ id: z.coerce.number().int().positive() });
  const articleIdParamSchema = z.object({ articleId: z.coerce.number().int().positive() });

  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS help_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      order_position INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS help_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      short_description TEXT,
      content TEXT,
      youtube_url TEXT,
      order_position INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES help_categories(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS help_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_id INTEGER NOT NULL,
      image_path TEXT NOT NULL,
      alt_text TEXT,
      order_position INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (article_id) REFERENCES help_articles(id) ON DELETE CASCADE
    )`);
  });

  function generateSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      || ('cat-' + Date.now());
  }

  function sanitizeHtml(html) {
    if (!html) return '';
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img', 'blockquote', 'code', 'pre', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'title', 'alt', 'src', 'class', 'target', 'rel'],
      ALLOW_DATA_ATTR: false,
    });
  }

  // =========================
  // ROTAS PÚBLICAS
  // =========================
  app.get('/api/help/categories', (req, res) => {
    db.all(
      `SELECT id, name, slug, description, icon, order_position
       FROM help_categories
       ORDER BY order_position ASC`,
      [],
      (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar categorias' });
        res.json(rows || []);
      }
    );
  });

  app.get('/api/help/categories/:slug', (req, res) => {
    db.get(
      `SELECT * FROM help_categories WHERE slug = ?`,
      [req.params.slug],
      (err, row) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar categoria' });
        if (!row) return res.status(404).json({ error: 'Categoria não encontrada' });
        res.json(row);
      }
    );
  });

  app.get('/api/help/categories/:categorySlug/articles', (req, res) => {
    db.all(
      `SELECT a.id, a.title, a.slug, a.short_description, a.youtube_url, a.order_position, a.views, a.created_at
       FROM help_articles a
       JOIN help_categories c ON a.category_id = c.id
       WHERE c.slug = ? AND a.status = 1
       ORDER BY a.order_position ASC`,
      [req.params.categorySlug],
      (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar artigos' });
        res.json(rows || []);
      }
    );
  });

  app.get('/api/help/articles/:slug', (req, res) => {
    db.get(
      `SELECT a.*, c.name as category_name, c.slug as category_slug
       FROM help_articles a
       JOIN help_categories c ON a.category_id = c.id
       WHERE a.slug = ? AND a.status = 1`,
      [req.params.slug],
      (err, article) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar artigo' });
        if (!article) return res.status(404).json({ error: 'Artigo não encontrado' });

        db.all(
          `SELECT id, image_path, alt_text, order_position
           FROM help_images
           WHERE article_id = ?
           ORDER BY order_position ASC`,
          [article.id],
          (imagesErr, images) => {
            if (imagesErr) return res.status(500).json({ error: 'Erro ao buscar imagens' });
            db.run(`UPDATE help_articles SET views = views + 1 WHERE id = ?`, [article.id]);
            res.json({ ...article, images: images || [] });
          }
        );
      }
    );
  });

  app.get('/api/help/search', (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 2) return res.json([]);

    const searchTerm = `%${query}%`;
    db.all(
      `SELECT a.id, a.title, a.slug, a.short_description, c.name as category_name, c.slug as category_slug
       FROM help_articles a
       JOIN help_categories c ON a.category_id = c.id
       WHERE a.status = 1 AND (a.title LIKE ? OR a.short_description LIKE ? OR a.content LIKE ?)
       ORDER BY a.title ASC
       LIMIT 20`,
      [searchTerm, searchTerm, searchTerm],
      (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro na busca' });
        res.json(rows || []);
      }
    );
  });

  // =========================
  // ROTAS ADMIN - CATEGORIAS
  // =========================
  app.get('/api/admin/help/categories', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM help_categories ORDER BY order_position ASC`, [], (err, rows) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar categorias' });
      res.json(rows || []);
    });
  });

  app.post('/api/admin/help/categories', authenticateToken, validateBody(helpCategorySchema), (req, res) => {
    const { name, description, icon } = req.validatedBody;
    const slug = generateSlug(name);

    const tryInsert = (slugAttempt, attempt) => {
      db.run(
        `INSERT INTO help_categories (name, slug, description, icon, order_position)
         VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(order_position), 0) + 1 FROM help_categories))`,
        [name, slugAttempt, description || '', icon || 'HelpCircle'],
        async function (err) {
          if (err) {
            if (err.message && err.message.includes('UNIQUE') && attempt < 5) {
              return tryInsert(`${slug}-${attempt + 1}`, attempt + 1);
            }
            return res.status(500).json({ error: 'Erro ao criar categoria: ' + err.message });
          }
          await logAudit(req, { userId: req.user?.id, action: 'create_help_category', entity: 'help_categories', entityId: this.lastID, details: { slug: slugAttempt, name } });
          res.json({ message: 'Categoria criada com sucesso', id: this.lastID, slug: slugAttempt });
        }
      );
    };

    tryInsert(slug, 0);
  });

  app.put('/api/admin/help/categories/:id', authenticateToken, validateParams(idParamSchema), validateBody(helpCategorySchema), (req, res) => {
    const { name, description, icon, order_position } = req.validatedBody;

    db.run(
      `UPDATE help_categories
       SET name = ?, description = ?, icon = ?, order_position = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, icon, order_position ?? 0, req.validatedParams.id],
      async function (err) {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar categoria' });
        if (this.changes === 0) return res.status(404).json({ error: 'Categoria não encontrada' });
        await logAudit(req, { userId: req.user?.id, action: 'update_help_category', entity: 'help_categories', entityId: req.validatedParams.id, details: { name } });
        res.json({ message: 'Categoria atualizada com sucesso' });
      }
    );
  });

  app.delete('/api/admin/help/categories/:id', authenticateToken, validateParams(idParamSchema), (req, res) => {
    db.run(`DELETE FROM help_categories WHERE id = ?`, [req.validatedParams.id], async function (err) {
      if (err) return res.status(500).json({ error: 'Erro ao excluir categoria' });
      if (this.changes === 0) return res.status(404).json({ error: 'Categoria não encontrada' });
      await logAudit(req, { userId: req.user?.id, action: 'delete_help_category', entity: 'help_categories', entityId: req.validatedParams.id });
      res.json({ message: 'Categoria excluída com sucesso' });
    });
  });

  // =========================
  // ROTAS ADMIN - ARTIGOS
  // =========================
  app.get('/api/admin/help/articles', authenticateToken, (req, res) => {
    db.all(
      `SELECT a.*, c.name as category_name
       FROM help_articles a
       LEFT JOIN help_categories c ON a.category_id = c.id
       ORDER BY a.category_id, a.order_position ASC`,
      [],
      (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar artigos' });
        res.json(rows || []);
      }
    );
  });

  app.post('/api/admin/help/articles', authenticateToken, validateBody(helpArticleSchema), (req, res) => {
    const { category_id, title, short_description, content, youtube_url } = req.validatedBody;
    const slug = generateSlug(title);
    const sanitizedContent = sanitizeHtml(content);

    const tryInsertArticle = (slugAttempt, attempt) => {
      db.run(
        `INSERT INTO help_articles (category_id, title, slug, short_description, content, youtube_url, order_position, status)
         VALUES (?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(order_position), 0) + 1 FROM help_articles WHERE category_id = ?), 1)`,
        [category_id, title, slugAttempt, short_description, sanitizedContent, youtube_url || '', category_id],
        async function (err) {
          if (err) {
            if (err.message && err.message.includes('UNIQUE') && attempt < 5) {
              return tryInsertArticle(`${slug}-${attempt + 1}`, attempt + 1);
            }
            return res.status(500).json({ error: 'Erro ao criar artigo: ' + err.message });
          }
          await logAudit(req, { userId: req.user?.id, action: 'create_help_article', entity: 'help_articles', entityId: this.lastID, details: { slug: slugAttempt, title } });
          res.json({ message: 'Artigo criado com sucesso', id: this.lastID, slug: slugAttempt });
        }
      );
    };

    tryInsertArticle(slug, 0);
  });

  app.put('/api/admin/help/articles/:id', authenticateToken, validateParams(idParamSchema), validateBody(helpArticleUpdateSchema), (req, res) => {
    const { title, short_description, content, youtube_url, order_position, status } = req.validatedBody;
    const sanitizedContent = sanitizeHtml(content);

    db.run(
      `UPDATE help_articles
       SET title = ?, short_description = ?, content = ?, youtube_url = ?, order_position = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, short_description, sanitizedContent, youtube_url, order_position, status, req.validatedParams.id],
      async function (err) {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar artigo' });
        if (this.changes === 0) return res.status(404).json({ error: 'Artigo não encontrado' });
        await logAudit(req, { userId: req.user?.id, action: 'update_help_article', entity: 'help_articles', entityId: req.validatedParams.id, details: { title } });
        res.json({ message: 'Artigo atualizado com sucesso' });
      }
    );
  });

  app.delete('/api/admin/help/articles/:id', authenticateToken, validateParams(idParamSchema), (req, res) => {
    db.all(`SELECT image_path FROM help_images WHERE article_id = ?`, [req.validatedParams.id], (err, images) => {
      db.run(`DELETE FROM help_articles WHERE id = ?`, [req.validatedParams.id], async function (err2) {
        if (err2) return res.status(500).json({ error: 'Erro ao excluir artigo' });
        if (this.changes === 0) return res.status(404).json({ error: 'Artigo não encontrado' });

        const fs = require('fs');
        const path = require('path');
        if (images && images.length > 0) {
          images.forEach(img => {
            const fullPath = path.join(MAX_UPLOAD_SIZE > 0 ? require('../../config/env').UPLOAD_DIR : '', path.basename(img.image_path));
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
          });
        }

        await logAudit(req, { userId: req.user?.id, action: 'delete_help_article', entity: 'help_articles', entityId: req.validatedParams.id });
        res.json({ message: 'Artigo excluído com sucesso' });
      });
    });
  });

  // =========================
  // ROTAS ADMIN - IMAGENS
  // =========================
  app.post('/api/admin/help/articles/:articleId/images', authenticateToken, validateParams(articleIdParamSchema), upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhuma imagem enviada' });

    const imagePath = `/uploads/${req.file.filename}`;
    const { alt_text } = req.body;

    db.run(
      `INSERT INTO help_images (article_id, image_path, alt_text, order_position)
       VALUES (?, ?, ?, (SELECT COALESCE(MAX(order_position), 0) + 1 FROM help_images WHERE article_id = ?))`,
      [req.validatedParams.articleId, imagePath, alt_text || '', req.validatedParams.articleId],
      async function (err) {
        if (err) return res.status(500).json({ error: 'Erro ao salvar imagem' });
        await logAudit(req, { userId: req.user?.id, action: 'upload_help_image', entity: 'help_images', entityId: this.lastID, details: { article_id: req.validatedParams.articleId } });
        res.json({ id: this.lastID, image_path: imagePath });
      }
    );
  });

  app.delete('/api/admin/help/images/:id', authenticateToken, validateParams(idParamSchema), (req, res) => {
    db.get(`SELECT image_path FROM help_images WHERE id = ?`, [req.validatedParams.id], (err, row) => {
      if (err || !row) return res.status(404).json({ error: 'Imagem não encontrada' });

      db.run(`DELETE FROM help_images WHERE id = ?`, [req.validatedParams.id], async function (err2) {
        if (err2) return res.status(500).json({ error: 'Erro ao excluir imagem' });
        if (this.changes > 0) {
          const fs = require('fs');
          const path = require('path');
          const fullPath = path.join(require('../../config/env').UPLOAD_DIR, path.basename(row.image_path));
          if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        }
        await logAudit(req, { userId: req.user?.id, action: 'delete_help_image', entity: 'help_images', entityId: req.validatedParams.id });
        res.json({ message: 'Imagem excluída com sucesso' });
      });
    });
  });
};

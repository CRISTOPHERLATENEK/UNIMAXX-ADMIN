// ========================================
// MÓDULO DE SUPORTE - HELP CENTER
// ========================================

module.exports = function(app, db, authenticateToken, upload) {

  // ========================================
  // CRIAR TABELAS
  // ========================================
  db.serialize(() => {
    // Tabela de categorias
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

    // Tabela de artigos
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

    // Tabela de imagens dos artigos
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

  // ========================================
  // FUNÇÕES AUXILIARES
  // ========================================

  // Gerar slug a partir de texto
  function generateSlug(text) {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')  // remove acentos
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      || ('cat-' + Date.now()); // fallback se ficar vazio
  }

  // Não escapar o conteúdo — o frontend usa whitespace-pre-wrap (texto puro)
  // Escapar aqui causaria o usuário ver &lt; &gt; literais na tela
  function sanitizeHtml(html) {
    return html || '';
  }

  // ========================================
  // ROTAS PÚBLICAS - CATEGORIAS
  // ========================================

  // Listar categorias públicas
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

  // Obter categoria por slug
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

  // ========================================
  // ROTAS PÚBLICAS - ARTIGOS
  // ========================================

  // Listar artigos de uma categoria
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

  // Obter artigo completo por slug
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

        // Buscar imagens do artigo
        db.all(
          `SELECT id, image_path, alt_text, order_position 
           FROM help_images 
           WHERE article_id = ? 
           ORDER BY order_position ASC`,
          [article.id],
          (err, images) => {
            if (err) return res.status(500).json({ error: 'Erro ao buscar imagens' });
            
            // Incrementar visualizações
            db.run(`UPDATE help_articles SET views = views + 1 WHERE id = ?`, [article.id]);
            
            res.json({
              ...article,
              images: images || []
            });
          }
        );
      }
    );
  });

  // Buscar artigos por palavra-chave
  app.get('/api/help/search', (req, res) => {
    const query = req.query.q;
    if (!query || query.length < 2) {
      return res.json([]);
    }

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

  // ========================================
  // ROTAS ADMIN - CATEGORIAS
  // ========================================

  // Listar todas as categorias (admin)
  app.get('/api/admin/help/categories', authenticateToken, (req, res) => {
    db.all(
      `SELECT * FROM help_categories ORDER BY order_position ASC`,
      [],
      (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar categorias' });
        res.json(rows || []);
      }
    );
  });

  // Criar categoria
  app.post('/api/admin/help/categories', authenticateToken, (req, res) => {
    const { name, description, icon } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const slug = generateSlug(name);

    // Se slug colidir, adiciona sufixo numérico
    const tryInsert = (slugAttempt, attempt) => {
      db.run(
        `INSERT INTO help_categories (name, slug, description, icon, order_position)
         VALUES (?, ?, ?, ?, (SELECT COALESCE(MAX(order_position), 0) + 1 FROM help_categories))`,
        [name, slugAttempt, description || '', icon || 'HelpCircle'],
        function(err) {
          if (err) {
            if (err.message && err.message.includes('UNIQUE') && attempt < 5) {
              return tryInsert(slug + '-' + (attempt + 1), attempt + 1);
            }
            console.error('Erro ao criar categoria:', err.message);
            return res.status(500).json({ error: 'Erro ao criar categoria: ' + err.message });
          }
          res.json({ message: 'Categoria criada com sucesso', id: this.lastID, slug: slugAttempt });
        }
      );
    };
    tryInsert(slug, 0);
  });

  // Atualizar categoria
  app.put('/api/admin/help/categories/:id', authenticateToken, (req, res) => {
    const { name, description, icon, order_position } = req.body;

    db.run(
      `UPDATE help_categories 
       SET name = ?, description = ?, icon = ?, order_position = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, description, icon, order_position, req.params.id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar categoria' });
        res.json({ message: 'Categoria atualizada com sucesso' });
      }
    );
  });

  // Excluir categoria
  app.delete('/api/admin/help/categories/:id', authenticateToken, (req, res) => {
    db.run(
      `DELETE FROM help_categories WHERE id = ?`,
      [req.params.id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao excluir categoria' });
        res.json({ message: 'Categoria excluída com sucesso' });
      }
    );
  });

  // ========================================
  // ROTAS ADMIN - ARTIGOS
  // ========================================

  // Listar todos os artigos (admin)
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

  // Criar artigo
  app.post('/api/admin/help/articles', authenticateToken, (req, res) => {
    const { category_id, title, short_description, content, youtube_url } = req.body;

    if (!category_id || !title) {
      return res.status(400).json({ error: 'Categoria e título são obrigatórios' });
    }

    const slug = generateSlug(title);
    const sanitizedContent = sanitizeHtml(content);

    const tryInsertArticle = (slugAttempt, attempt) => {
      db.run(
        `INSERT INTO help_articles (category_id, title, slug, short_description, content, youtube_url, order_position, status)
         VALUES (?, ?, ?, ?, ?, ?, (SELECT COALESCE(MAX(order_position), 0) + 1 FROM help_articles WHERE category_id = ?), 1)`,
        [category_id, title, slugAttempt, short_description, sanitizedContent, youtube_url || '', category_id],
        function(err) {
          if (err) {
            if (err.message && err.message.includes('UNIQUE') && attempt < 5) {
              return tryInsertArticle(slug + '-' + (attempt + 1), attempt + 1);
            }
            console.error('Erro ao criar artigo:', err.message);
            return res.status(500).json({ error: 'Erro ao criar artigo: ' + err.message });
          }
          res.json({ message: 'Artigo criado com sucesso', id: this.lastID, slug: slugAttempt });
        }
      );
    };
    tryInsertArticle(slug, 0);
  });

  // Atualizar artigo
  app.put('/api/admin/help/articles/:id', authenticateToken, (req, res) => {
    const { title, short_description, content, youtube_url, order_position, status } = req.body;

    const sanitizedContent = sanitizeHtml(content);

    db.run(
      `UPDATE help_articles 
       SET title = ?, short_description = ?, content = ?, youtube_url = ?, order_position = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, short_description, sanitizedContent, youtube_url, order_position, status, req.params.id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar artigo' });
        res.json({ message: 'Artigo atualizado com sucesso' });
      }
    );
  });

  // Excluir artigo
  app.delete('/api/admin/help/articles/:id', authenticateToken, (req, res) => {
    db.run(
      `DELETE FROM help_articles WHERE id = ?`,
      [req.params.id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao excluir artigo' });
        res.json({ message: 'Artigo excluído com sucesso' });
      }
    );
  });

  // ========================================
  // ROTAS ADMIN - IMAGENS
  // ========================================

  // Listar imagens de um artigo
  app.get('/api/admin/help/articles/:articleId/images', authenticateToken, (req, res) => {
    db.all(
      `SELECT * FROM help_images WHERE article_id = ? ORDER BY order_position ASC`,
      [req.params.articleId],
      (err, rows) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar imagens' });
        res.json(rows || []);
      }
    );
  });

  // Upload de imagem para artigo
  app.post('/api/admin/help/articles/:articleId/images', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const { alt_text } = req.body;
    const imagePath = `/uploads/${req.file.filename}`;

    db.run(
      `INSERT INTO help_images (article_id, image_path, alt_text, order_position)
       VALUES (?, ?, ?, (SELECT COALESCE(MAX(order_position), 0) + 1 FROM help_images WHERE article_id = ?))`,
      [req.params.articleId, imagePath, alt_text || '', req.params.articleId],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao salvar imagem' });
        res.json({ 
          message: 'Imagem enviada com sucesso', 
          id: this.lastID,
          url: imagePath
        });
      }
    );
  });

  // Excluir imagem
  app.delete('/api/admin/help/images/:id', authenticateToken, (req, res) => {
    db.run(
      `DELETE FROM help_images WHERE id = ?`,
      [req.params.id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao excluir imagem' });
        res.json({ message: 'Imagem excluída com sucesso' });
      }
    );
  });

  // Atualizar ordem das imagens
  app.put('/api/admin/help/images/:id', authenticateToken, (req, res) => {
    const { order_position, alt_text } = req.body;

    db.run(
      `UPDATE help_images SET order_position = ?, alt_text = ? WHERE id = ?`,
      [order_position, alt_text, req.params.id],
      function(err) {
        if (err) return res.status(500).json({ error: 'Erro ao atualizar imagem' });
        res.json({ message: 'Imagem atualizada com sucesso' });
      }
    );
  });

};

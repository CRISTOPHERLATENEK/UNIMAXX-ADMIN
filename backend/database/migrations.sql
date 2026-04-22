-- Migração: Expansão do sistema para CMS completo
-- Data: 2026-04-14

-- Tabela de configurações globais do tema
CREATE TABLE IF NOT EXISTS theme_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    primary_color VARCHAR(7) DEFAULT '#0070f3',
    secondary_color VARCHAR(7) DEFAULT '#00c4cc',
    accent_color VARCHAR(7) DEFAULT '#7928ca',
    success_color VARCHAR(7) DEFAULT '#17c964',
    warning_color VARCHAR(7) DEFAULT '#f5a524',
    error_color VARCHAR(7) DEFAULT '#f31260',
    font_family VARCHAR(50) DEFAULT 'Inter',
    heading_font VARCHAR(50) DEFAULT 'Inter',
    base_font_size VARCHAR(10) DEFAULT '16px',
    border_radius VARCHAR(10) DEFAULT '8px',
    max_width VARCHAR(10) DEFAULT '1280px',
    logo_url TEXT,
    favicon_url TEXT,
    custom_css TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configuração padrão
INSERT OR IGNORE INTO theme_settings (id) VALUES (1);

-- Tabela de páginas dinâmicas
CREATE TABLE IF NOT EXISTS pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    meta_title VARCHAR(200),
    meta_description TEXT,
    meta_keywords TEXT,
    og_image TEXT,
    canonical_url TEXT,
    is_published BOOLEAN DEFAULT 0,
    is_homepage BOOLEAN DEFAULT 0,
    layout_json TEXT NOT NULL,
    created_by INTEGER,
    updated_by INTEGER,
    published_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Tabela de componentes/blocks reutilizáveis
CREATE TABLE IF NOT EXISTS components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    content_json TEXT NOT NULL,
    styles_json TEXT,
    is_global BOOLEAN DEFAULT 0,
    category VARCHAR(50),
    order_index INTEGER DEFAULT 0,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabela de mídia/galeria
CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    mime_type VARCHAR(50),
    size INTEGER,
    url TEXT NOT NULL,
    alt_text TEXT,
    title TEXT,
    folder VARCHAR(100) DEFAULT 'general',
    width INTEGER,
    height INTEGER,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Tabela de menus/navegação
CREATE TABLE IF NOT EXISTS menus (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(50) NOT NULL,
    location VARCHAR(50) UNIQUE NOT NULL,
    items_json TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir menus padrão
INSERT OR IGNORE INTO menus (name, location, items_json) VALUES 
('Menu Principal', 'header', '[]'),
('Menu Rodapé', 'footer', '[]');

-- Tabela de formulários dinâmicos
CREATE TABLE IF NOT EXISTS forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    fields_json TEXT NOT NULL,
    email_notifications TEXT,
    success_message TEXT DEFAULT 'Mensagem enviada com sucesso!',
    submit_button_text VARCHAR(50) DEFAULT 'Enviar',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de submissions de formulários
CREATE TABLE IF NOT EXISTS form_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    form_id INTEGER,
    data_json TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Expansão da tabela de usuários
CREATE TABLE IF NOT EXISTS users_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'editor',
    permissions_json TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT 1,
    last_login DATETIME,
    email_verified BOOLEAN DEFAULT 0,
    reset_token TEXT,
    reset_token_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migrar dados antigos se existirem
INSERT OR IGNORE INTO users_new (id, email, password_hash, name, role, created_at)
SELECT id, email, password_hash, name, 'admin', CURRENT_TIMESTAMP 
FROM users WHERE EXISTS (SELECT 1 FROM users);

-- Tabela de histórico/audit log
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    changes_json TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users_new(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder);
CREATE INDEX IF NOT EXISTS idx_submissions_form ON form_submissions(form_id);

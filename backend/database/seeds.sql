-- Seeds para dados iniciais do sistema
-- Execute após rodar as migrações

-- Usuário admin padrão (senha: admin123 - ALTERE IMEDIATAMENTE)
-- Hash gerado com bcrypt (12 rounds)
INSERT OR IGNORE INTO users_new (id, email, password_hash, name, role, created_at) 
VALUES (
    1, 
    'admin@unimaxx.com', 
    '$2b$12$YourHashedPasswordHereChangeThisImmediately', 
    'Administrador', 
    'admin',
    CURRENT_TIMESTAMP
);

-- Página inicial de exemplo
INSERT OR IGNORE INTO pages (id, slug, title, meta_title, meta_description, is_published, is_homepage, layout_json, created_by, published_at) 
VALUES (
    1,
    'home',
    'Página Inicial',
    'UNIMAXX - Soluções Digitais',
    'Descrição da sua empresa aqui',
    1,
    1,
    '[
        {
            "id": "comp-hero-1",
            "type": "hero",
            "props": {
                "title": "Bem-vindo à UNIMAXX",
                "subtitle": "Transformamos sua presença digital com soluções inovadoras",
                "ctaText": "Conheça Nossas Soluções",
                "ctaLink": "#solucoes",
                "alignment": "center",
                "height": "600px",
                "overlayOpacity": 0.4
            },
            "styles": {
                "padding": "80px 20px",
                "backgroundColor": "#1a1a1a",
                "color": "#ffffff"
            }
        },
        {
            "id": "comp-features-1",
            "type": "features",
            "props": {
                "title": "Nossos Diferenciais",
                "subtitle": "O que nos torna únicos",
                "columns": 3,
                "items": [
                    {
                        "icon": "Zap",
                        "title": "Rápido",
                        "description": "Performance otimizada para melhor experiência"
                    },
                    {
                        "icon": "Shield",
                        "title": "Seguro",
                        "description": "Proteção de dados e conformidade LGPD"
                    },
                    {
                        "icon": "Headphones",
                        "title": "Suporte",
                        "description": "Atendimento especializado 24/7"
                    }
                ]
            },
            "styles": {
                "padding": "60px 20px",
                "backgroundColor": "#f9fafb"
            }
        },
        {
            "id": "comp-cta-1",
            "type": "cta",
            "props": {
                "title": "Pronto para começar?",
                "subtitle": "Entre em contato conosco hoje mesmo",
                "buttonText": "Fale Conosco",
                "buttonLink": "/contato"
            },
            "styles": {
                "padding": "60px 20px",
                "backgroundColor": "#0070f3",
                "color": "#ffffff"
            }
        }
    ]',
    1,
    CURRENT_TIMESTAMP
);

-- Menu header padrão
UPDATE menus SET items_json = '[
    {"label": "Home", "url": "/", "target": "_self"},
    {"label": "Sobre", "url": "/sobre", "target": "_self"},
    {"label": "Soluções", "url": "#solucoes", "target": "_self", "children": [
        {"label": "ERP", "url": "/erp", "target": "_self"},
        {"label": "PDV", "url": "/pdv", "target": "_self"}
    ]},
    {"label": "Contato", "url": "/contato", "target": "_self"}
]' WHERE location = 'header';

-- Menu footer padrão
UPDATE menus SET items_json = '[
    {"label": "Home", "url": "/", "target": "_self"},
    {"label": "Política de Privacidade", "url": "/privacidade", "target": "_self"},
    {"label": "Termos de Uso", "url": "/termos", "target": "_self"}
]' WHERE location = 'footer';

-- Formulário de contato padrão
INSERT OR IGNORE INTO forms (id, name, slug, fields_json, email_notifications, success_message) 
VALUES (
    1,
    'Contato',
    'contato',
    '[
        {"name": "nome", "label": "Nome", "type": "text", "required": true},
        {"name": "email", "label": "Email", "type": "email", "required": true},
        {"name": "telefone", "label": "Telefone", "type": "tel", "required": false},
        {"name": "mensagem", "label": "Mensagem", "type": "textarea", "required": true}
    ]',
    'admin@unimaxx.com',
    'Obrigado pelo contato! Retornaremos em breve.'
);

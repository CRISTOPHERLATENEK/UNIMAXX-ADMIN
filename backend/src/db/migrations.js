const { DB_PATH, NODE_ENV } = require('../config/env');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const { db, parseArr, toJson } = require('./database');

function runMigrations() {
  db.serialize(() => {

    // ── Usuários ──────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ── Help ──────────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS help_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE,
      description TEXT,
      icon TEXT DEFAULT 'HelpCircle',
      order_num INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS help_articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      slug TEXT UNIQUE,
      short_description TEXT,
      content TEXT,
      order_num INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
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
      FOREIGN KEY (article_id) REFERENCES help_articles(id) ON DELETE CASCADE
    )`);

    // ── Conteúdo / Settings ───────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      type TEXT DEFAULT 'text',
      UNIQUE(section, key)
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS site_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL
    )`);

    // ── Soluções ──────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS solutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      solution_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      features TEXT NOT NULL,
      cta_text TEXT DEFAULT 'Saiba mais',
      icon TEXT DEFAULT 'Building2',
      image TEXT DEFAULT '',
      order_num INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      nav_link TEXT DEFAULT ''
    )`);

    // ── Segmentos ─────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS segments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      segment_id TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      icon TEXT,
      image TEXT DEFAULT '',
      description TEXT DEFAULT '',
      order_num INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      show_home INTEGER DEFAULT 0
    )`);

    // ── Stats ─────────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stat_id TEXT UNIQUE NOT NULL,
      value TEXT NOT NULL,
      label TEXT NOT NULL,
      suffix TEXT DEFAULT '',
      section TEXT NOT NULL DEFAULT 'numbers',
      order_num INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1
    )`);

    // ── Banners ───────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS banners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT, subtitle TEXT, description TEXT,
      image TEXT, cta_text TEXT, cta_link TEXT,
      order_num INTEGER DEFAULT 0,
      active INTEGER DEFAULT 1,
      use_default_bg INTEGER DEFAULT 1,
      use_style INTEGER DEFAULT 1,
      bg_color TEXT DEFAULT '',
      page TEXT DEFAULT 'home',
      banner_style TEXT DEFAULT ''
    )`);

    // ── Solution Pages (lean: apenas metadados + blocks_json) ─────────────
    db.run(`CREATE TABLE IF NOT EXISTS solution_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      icon TEXT DEFAULT 'Building2',
      color_theme TEXT DEFAULT 'orange',
      meta_title TEXT DEFAULT '',
      meta_description TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      blocks_json TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Migração de compatibilidade: colunas legadas tornam-se opcionais
    // para bases existentes que ainda as tenham
    [
      'ALTER TABLE solution_pages ADD COLUMN subtitle TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN description TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN features TEXT DEFAULT \'[]\'',
      'ALTER TABLE solution_pages ADD COLUMN benefits TEXT DEFAULT \'[]\'',
      'ALTER TABLE solution_pages ADD COLUMN integrations TEXT DEFAULT \'[]\'',
      'ALTER TABLE solution_pages ADD COLUMN hero_image TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN stats_json TEXT DEFAULT \'[]\'',
      'ALTER TABLE solution_pages ADD COLUMN cta_title TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN cta_description TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN cta_button_label TEXT DEFAULT \'Falar com Especialista\'',
      'ALTER TABLE solution_pages ADD COLUMN features_title TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN benefits_title TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN faq_json TEXT DEFAULT \'[]\'',
      'ALTER TABLE solution_pages ADD COLUMN steps_json TEXT DEFAULT \'[]\'',
      'ALTER TABLE solution_pages ADD COLUMN steps_title TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN video_url TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN video_title TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN screenshots_json TEXT DEFAULT \'[]\'',
      'ALTER TABLE solution_pages ADD COLUMN screenshots_title TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN differentials_json TEXT DEFAULT \'[]\'',
      'ALTER TABLE solution_pages ADD COLUMN differentials_title TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN highlight_title TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN highlight_text TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN testimonial_quote TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN testimonial_author TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN testimonial_role TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN secondary_cta_label TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN secondary_cta_link TEXT DEFAULT \'\'',
      'ALTER TABLE solution_pages ADD COLUMN page_template TEXT DEFAULT \'default\'',
    ].forEach(sql => db.run(sql, [], () => {}));

    // ── Páginas Genéricas (CMS via Page Builder) ──────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS generic_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      meta_title TEXT DEFAULT '',
      meta_description TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      blocks_json TEXT DEFAULT '[]',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ── Logos, Depoimentos, Parceiros ─────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS client_logos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, image TEXT NOT NULL,
      url TEXT DEFAULT '', order_num INTEGER DEFAULT 0, active INTEGER DEFAULT 1
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_name TEXT NOT NULL,
      author_role TEXT DEFAULT '', author_company TEXT DEFAULT '', author_photo TEXT DEFAULT '',
      content TEXT NOT NULL,
      rating INTEGER DEFAULT 5, order_num INTEGER DEFAULT 0, active INTEGER DEFAULT 1
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL, image TEXT NOT NULL,
      url TEXT DEFAULT '', category TEXT DEFAULT 'parceiro',
      order_num INTEGER DEFAULT 0, active INTEGER DEFAULT 1
    )`);

    // ── Leads ─────────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT DEFAULT '',
      segment TEXT DEFAULT '',
      message TEXT DEFAULT '',
      read_at DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // ── Newsletter ────────────────────────────────────────────────────────
    db.run(`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT DEFAULT '',
      source TEXT DEFAULT 'rodapé',
      unsubscribe_token TEXT UNIQUE,
      subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      unsubscribed_at DATETIME DEFAULT NULL
    )`);

    seedContent();
    seedAdmin();
  });
}

function seedContent() {
  const settings = {
    primary_color: '#00a8e8',
    whatsapp_number: '',
    whatsapp_message: 'Olá! Gostaria de saber mais sobre as soluções Unimaxx.',
    whatsapp_visible: '1',
    social_linkedin: '',
    social_facebook: '',
    social_instagram: '',
    social_youtube: '',
    seo_site_name: 'Unimaxx',
    maps_embed_url: '',
    seo_default_description: 'Soluções tecnológicas completas para o varejo.',
    analytics_id: '',
    font_heading: 'Outfit',
    font_body: 'DM Sans', secondary_color: '#0090c9',
    accent_color: '#0077aa', bg_color: '#ffffff', text_color: '#111827',
  };
  Object.entries(settings).forEach(([k, v]) =>
    db.run('INSERT OR IGNORE INTO site_settings (key, value) VALUES (?, ?)', [k, v])
  );

  const content = [
    ['header.logo','header',''], ['header.company','header','Unimaxx'],
    ['header.nav.solutions','header','Soluções'], ['header.nav.institutional','header','Institucional'],
    ['header.nav.support','header','Suporte'], ['header.nav.contact','header','Fale Conosco'],
    ['hero.title','hero','Tecnologia que Impulsiona o Varejo'],
    ['hero.subtitle','hero','Soluções integradas para sua empresa crescer com mais eficiência e resultado.'],
    ['hero.cta_primary','hero','Conheça as Soluções'], ['hero.cta_secondary','hero','Fale com Especialista'],
    ['hero.image','hero',''],
    ['home_highlight.enabled','home_highlight','0'],
    ['home_highlight.badge','home_highlight','Destaque'],
    ['home_highlight.title','home_highlight',''],
    ['home_highlight.description','home_highlight',''],
    ['home_highlight.cta_text','home_highlight',''],
    ['home_highlight.cta_link','home_highlight','/cliente'],
    ['home_highlight.image','home_highlight',''],
    ['quicklinks.title','quicklinks','Acesso Rápido'], ['quicklinks.subtitle','quicklinks','Encontre o que precisa com agilidade'],
    ['solutions.title','solutions','Nossas Soluções'], ['solutions.subtitle','solutions','Tecnologia completa para o seu negócio'],
    ['stats.title','stats','Nossos Números'], ['stats.subtitle','stats','Unimaxx em detalhes'],
    ['stats.description','stats','Confira os indicadores que mostram nossa força no mercado.'],
    ['segmentos_page.badge','segmentos_page','Segmentos de Mercado'],
    ['segmentos_page.title_line1','segmentos_page','Soluções para'],
    ['segmentos_page.title_line2','segmentos_page','cada negócio'],
    ['segmentos_page.description','segmentos_page','Do varejo à alimentação, da farmácia ao delivery — temos a solução especializada para o seu segmento.'],
    ['segments.title','segments','Segmentos Atendidos'], ['segments.subtitle','segments','Soluções para cada setor do varejo'],
    ['differentials.title','differentials','Por que a Unimaxx?'], ['differentials.subtitle','differentials','Diferenciais que fazem a diferença'],
    ['differentials.item1_title','differentials','Suporte 24/7'], ['differentials.item1_desc','differentials','Atendimento especializado a qualquer hora.'],
    ['differentials.item2_title','differentials','Integração Total'], ['differentials.item2_desc','differentials','Sistemas que conversam entre si.'],
    ['differentials.item3_title','differentials','Experiência no Varejo'], ['differentials.item3_desc','differentials','Anos de expertise no setor varejista.'],
    ['contact.title','contact','Entre em Contato'], ['contact.subtitle','contact','Nossa equipe está pronta para te atender'],
    ['contact.description','contact','Ligamos para você em até 1h. Conte sobre seu negócio e encontre a solução ideal.'],
    ['contact.phone','contact','(00) 0000-0000'], ['contact.email','contact','contato@unimaxx.com.br'],
    ['contact.address','contact','Seu endereço aqui'], ['contact.hours','contact','Seg–Sex, 8h às 18h'],
    ['contact.whatsapp','contact',''],
    ['footer.logo','footer',''], ['footer.company','footer','Unimaxx'],
    ['sobre.enabled','sobre','1'],
    ['sobre.title','sobre','Sobre a Unimaxx'],
    ['sobre.subtitle','sobre','Líder em tecnologia para o varejo brasileiro há mais de 35 anos.'],
    ['sobre.historia_title','sobre','Nossa História'],
    ['sobre.historia_text','sobre','A Unimaxx nasce com o objetivo de inovar no varejo brasileiro, transformando complexidade em resultado.'],
    ['sobre.missao','sobre','Transformar o varejo brasileiro por meio de tecnologia acessível, integrada e de alto desempenho.'],
    ['sobre.visao','sobre','Ser a plataforma de tecnologia mais completa e confiável para o varejo da América Latina.'],
    ['sobre.proposito','sobre','Empoderar o varejo com tecnologia acessível que faz a diferença no dia a dia.'],
    ['sobre.valores','sobre','Inovação, Integridade, Foco no Cliente, Colaboração'],
    ['sobre.valores_list','sobre','[]'],
    ['sobre.timeline','sobre','[]'],
    ['sobre.premios_list','sobre','[]'],
    ['sobre.stat1_number','sobre','35+'], ['sobre.stat1_label','sobre','Anos de História'],
    ['sobre.stat2_number','sobre','60K+'], ['sobre.stat2_label','sobre','Clientes'],
    ['sobre.stat3_number','sobre','4K+'],  ['sobre.stat3_label','sobre','Colaboradores'],
    ['sobre.stat4_number','sobre','16'],   ['sobre.stat4_label','sobre','Países'],
    ['sobre.cta_title','sobre','Faça parte da nossa história'],
    ['sobre.cta_text','sobre','Junte-se a mais de 60 mil empresas que confiam na Unimaxx.'],
    ['carreiras.enabled','carreiras','1'],
    ['carreiras.title','carreiras','Trabalhe Conosco'],
    ['carreiras.subtitle','carreiras','Faça parte de um time apaixonado por tecnologia e inovação.'],
    ['carreiras.beneficios','carreiras','Plano de saúde, Vale refeição, Flexibilidade de horário'],
    ['carreiras.vagas','carreiras','[]'],
    ['carreiras.email','carreiras',''],
    ['carreiras.linkedin','carreiras',''],
    ['blog.enabled','blog','1'],
    ['blog.title','blog','Blog & Conteúdo'],
    ['blog.subtitle','blog','Artigos sobre varejo, tecnologia e gestão.'],
    ['blog.posts','blog','[]'],
    ['imprensa.enabled','imprensa','1'],
    ['imprensa.title','imprensa','Sala de Imprensa'],
    ['imprensa.subtitle','imprensa','Notícias, press releases e cobertura da mídia.'],
    ['imprensa.email','imprensa',''],
    ['imprensa.phone','imprensa',''],
    ['imprensa.releases','imprensa','[]'],
    ['popup.enabled','popup','0'],
    ['popup.title','popup','Novidade Unimaxx!'],
    ['popup.text','popup','Conheça nossa nova solução de gestão integrada para o varejo.'],
    ['popup.cta_label','popup','Saiba mais'],
    ['popup.cta_link','popup','/solucoes'],
    ['cookie.enabled','cookie','1'],
    ['cookie.text','cookie','Usamos cookies para melhorar sua experiência. Ao continuar navegando, você concorda com nossa política de privacidade.'],
    ['cookie.btn_label','cookie','Aceitar'],
    ['footer.description','footer','Líder em tecnologia para o varejo. Transformando complexidade em resultado.'],
    ['footer.copyright','footer','© 2025 Unimaxx Soluções em Tecnologia. Todos os direitos reservados.'],
    ['clients.title','clients','Empresas que confiam na Unimaxx'],
    ['testimonials.label','testimonials','Depoimentos'],
    ['testimonials.title','testimonials','O que nossos'], ['testimonials.subtitle','testimonials','clientes dizem'],
    ['partners.label','partners','Integrações & Parceiros'],
    ['partners.title','partners','Ecossistema integrado'],
    ['partners.description','partners','Conectamos com as principais soluções do mercado para você ter tudo em um só lugar.'],
  ];
  content.forEach(([key, section, value]) =>
    db.run('INSERT OR IGNORE INTO site_content (section, key, value) VALUES (?, ?, ?)', [section, key, value])
  );

  [['900','Empresas Atendidas','numbers-1'],['4K+','Colaboradores','numbers-2'],['17','Profissionais no Brasil','numbers-3']]
    .forEach(([v,l,id],i) => db.run("INSERT OR IGNORE INTO stats (value,label,stat_id,section,order_num) VALUES (?,?,?,'numbers',?)",[v,l,id,i]));

  [['15.000+','Empresas ativas','seg-strip-1'],['98%','Taxa de satisfação','seg-strip-2'],['24/7','Suporte especializado','seg-strip-3']]
    .forEach(([v,l,id],i) => db.run("INSERT OR IGNORE INTO stats (value,label,stat_id,section,order_num) VALUES (?,?,?,'segmentos-strip',?)",[v,l,id,i]));
}

function seedAdmin() {
  const shouldSeed = NODE_ENV !== 'production' || String(process.env.SEED_ADMIN).toLowerCase() === 'true';
  if (!shouldSeed) return;
  const email = process.env.ADMIN_EMAIL || 'admin@unimaxx.com.br';
  const passwordHash = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);
  const name = process.env.ADMIN_NAME || 'Administrador';
  db.run('INSERT OR IGNORE INTO users (email, password, name) VALUES (?, ?, ?)', [email, passwordHash, name]);
}

module.exports = { runMigrations };

// Esta função é chamada no final do runMigrations — adicione as tabelas de analytics
function addAnalyticsTables() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS pageviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      page TEXT NOT NULL,
      referrer TEXT DEFAULT '',
      ua TEXT DEFAULT '',
      ip TEXT DEFAULT '',
      session_id TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE INDEX IF NOT EXISTS idx_pageviews_created ON pageviews(created_at)`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_pageviews_page ON pageviews(page)`);

    db.run(`CREATE TABLE IF NOT EXISTS page_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event TEXT NOT NULL,
      page TEXT DEFAULT '',
      session_id TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);
  });
}

addAnalyticsTables();

// Adiciona coluna unsubscribe_token em bancos existentes (idempotente)
db.run(`ALTER TABLE newsletter_subscribers ADD COLUMN unsubscribe_token TEXT UNIQUE`, [], () => {
  // Preenche tokens para inscritos que ainda não têm
  const crypto = require('crypto');
  db.all('SELECT id FROM newsletter_subscribers WHERE unsubscribe_token IS NULL', [], (err, rows) => {
    if (err || !rows) return;
    rows.forEach(row => {
      db.run('UPDATE newsletter_subscribers SET unsubscribe_token = ? WHERE id = ?',
        [crypto.randomUUID(), row.id]);
    });
  });
});

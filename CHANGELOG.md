# Melhorias Implementadas — CMS/Admin

## 1. SEGURANÇA (Backend)

### `backend/server.js`
- ✅ `helmet` agora ativado com headers de segurança HTTP
- ✅ `express-rate-limit` aplicado: login (10 req/15min), upload (20/hora), API geral (200/min)
- ✅ Cache HTTP `Cache-Control` nas rotas `/api/data` e `/api/solutions`

### `backend/src/routes/admin/auth.js`
- ✅ JWT expira em **2h** (era 24h)
- ✅ Novo endpoint `POST /api/auth/refresh` para renovar token
- ✅ **Proteção brute-force**: conta bloqueada por 15 min após 5 tentativas falhas
- ✅ Log de auditoria no login bem-sucedido

### `backend/src/db/migrations.js`
- ✅ Colunas `failed_attempts`, `locked_until`, `role` adicionadas em `users`
- ✅ Colunas `starts_at`, `ends_at` adicionadas em `banners`
- ✅ Tabela `audit_log` criada
- ✅ Colunas `company`, `subject` garantidas em `leads`

### `backend/src/middleware/upload.js`
- ✅ Limite de upload reduzido de 20MB para **5MB**

### `backend/src/middleware/auditLog.js` *(novo)*
- ✅ Helper `audit()` para registrar ações na tabela `audit_log`
- ✅ Middleware `auditMiddleware()` para wrapear rotas Express

### `backend/src/routes/admin/leads.js`
- ✅ Novo endpoint `GET /admin/leads/unread-count` — retorna contagem de não lidos
- ✅ Novo endpoint `GET /admin/leads/export` — CSV com BOM (compatível Excel)
- ✅ Auditoria no DELETE de lead

### `backend/src/routes/admin/banners.js`
- ✅ Campos `starts_at` e `ends_at` no CREATE e UPDATE

### `backend/src/routes/public/index.js`
- ✅ Banners filtrados por agendamento: respeita `starts_at` e `ends_at`

---

## 2. FRONTEND — Público

### `frontend/index.html`
- ✅ Google Fonts carregado: **Outfit** + **DM Sans** (era só preconnect sem link)
- ✅ Meta tags Open Graph (`og:title`, `og:description`, `og:type`)
- ✅ Twitter Card
- ✅ Favicon SVG embutido
- ✅ `<title>` e `<meta name="description">` preenchidos

### `frontend/src/index.css`
- ✅ Keyframe `pageFadeIn` e classe `.page-transition` para transições de rota

### `frontend/src/App.tsx`
- ✅ Wrapper `.page-transition` nas rotas públicas — fade-in suave ao trocar de página

---

## 3. AUTENTICAÇÃO

### `frontend/src/context/AuthContext.tsx`
- ✅ Salva `refreshToken` no localStorage após login
- ✅ Intercepta 401/403 no `fetchUser` e faz refresh automático antes de deslogar
- ✅ Verificação proativa a cada 5 min: renova token quando faltam < 10 min para expirar

---

## 4. PAINEL ADMIN — Navegação

### `frontend/src/admin/AdminLayout.tsx`
- ✅ Grupos do menu renomeados: `MAIN` → `GERAL`, `SETTINGS` → `CONFIGURAÇÕES`, `PROVA SOCIAL` → `CREDIBILIDADE`
- ✅ `Features Marquee` → `Logos em Destaque`
- ✅ `Editor da Home` → `Seções da Home`, `Conteúdo Geral` → `Textos e Logos`, `Páginas do Site` → `Páginas Extras`
- ✅ **Banners & Carrossel** adicionado ao menu (estava no checklist do Dashboard mas sem item no sidebar)
- ✅ Badge com contagem de leads não lidos no item "Leads & Contatos" (polling a cada 60s)

---

## 5. PAINEL ADMIN — Dashboard

### `frontend/src/admin/Dashboard.tsx`
- ✅ Seção "Atalhos" renomeada para "Ações Rápidas" com descrições contextuais
- ✅ Atalho para "Editar Hero da Home", "Nova Solução", "Banners & Carrossel"
- ✅ Badge de leads não lidos visível diretamente no atalho de Leads
- ✅ Polling de contagem de não lidos ao carregar

---

## 6. PAINEL ADMIN — Leads

### `frontend/src/admin/LeadsManager.tsx`
- ✅ Campo de busca em tempo real (nome, email, telefone, segmento, mensagem)
- ✅ Exportar CSV via backend (com BOM para compatibilidade com Excel)

---

## 7. PAINEL ADMIN — Banners

### `frontend/src/admin/BannersManager.tsx`
- ✅ Campos `starts_at` e `ends_at` (datetime-local) para agendar exibição
- ✅ Botão "Remover agendamento" quando datas estão definidas

### `frontend/src/types/index.ts`
- ✅ Interface `Banner` atualizada com `starts_at?` e `ends_at?`

---

## 8. PAINEL ADMIN — Soluções

### `frontend/src/admin/SolutionsManager.tsx`
- ✅ Busca em tempo real por nome/descrição
- ✅ Paginação: 10 itens por página com controles Anterior/Próxima

---

## 9. PAINEL ADMIN — Páginas de Soluções

### `frontend/src/admin/SolutionPagesManager.tsx`
- ✅ Paginação: 10 itens por página (busca já existia)

---

## 10. PAINEL ADMIN — Page Builder

### `frontend/src/admin/PageBuilder.tsx`
- ✅ **Undo/Redo**: stack de até 20 estados, atalhos `Ctrl+Z` / `Ctrl+Y`
- ✅ **Duplicar bloco**: botão no header de cada BlockCard
- ✅ **Exportar blocos**: baixa `blocks-{timestamp}.json`
- ✅ **Importar blocos**: carrega JSON e substitui blocos atuais (com confirmação)
- ✅ Confirmação (`window.confirm`) ao excluir bloco
- ✅ Barra de ferramentas visível no topo do builder

---

## 11. RESPONSIVIDADE

### `frontend/src/admin/Settings.tsx`, `PartnersManager.tsx`, `UnifiedSolutionsManager.tsx`
- ✅ `grid-cols-2/3` fixos convertidos para `grid-cols-1 sm:grid-cols-2/3` (mobile-first)

---

## Como aplicar

1. Substitua cada arquivo modificado pelo arquivo correspondente desta pasta
2. No backend, execute `npm install` (helmet e express-rate-limit já estão no package.json)
3. As migrações de banco de dados são automáticas no próximo start do servidor
4. No frontend, execute `npm run build`

> **Compatibilidade**: todas as alterações de banco usam `ALTER TABLE ... ADD COLUMN` com `IF NOT EXISTS` implícito via `try/catch` — não há risco de perda de dados.

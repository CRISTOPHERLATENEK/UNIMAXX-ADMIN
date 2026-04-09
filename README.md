<<<<<<< HEAD
# Unimaxx Site - Site Corporativo com Painel Administrativo

Site corporativo completo para a Unimaxx com painel administrativo para gerenciamento de conteúdo.

## Estrutura do Projeto

```
linx-site/
├── backend/          # API Node.js com SQLite
│   ├── server.js     # Servidor principal
│   ├── package.json
│   └── .env.example
├── frontend/         # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── sections/ # Seções do site
│   │   ├── admin/    # Painel administrativo
│   │   ├── context/  # Contextos React
│   │   ├── data/     # Dados padrão
│   │   └── types/    # Tipos TypeScript
│   ├── package.json
│   └── .env.example
└── README.md
```

## Funcionalidades

### Site Público
- ✅ Header com navegação dropdown
- ✅ Hero com estatísticas
- ✅ Quick Links (ERP, PDV, Digital, BI)
- ✅ Seção de Soluções
- ✅ Nossos Números
- ✅ Segmentos
- ✅ Diferenciais
- ✅ Formulário de Contato
- ✅ Footer

### Painel Administrativo
- ✅ Login com JWT
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de Conteúdo (todos os textos do site)
- ✅ Gerenciamento de Soluções (CRUD completo)
- ✅ Gerenciamento de Segmentos (CRUD completo)
- ✅ Gerenciamento de Estatísticas
- ✅ Configurações de perfil

## Instalação

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm start
```

O servidor estará rodando em `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

O site estará disponível em `http://localhost:5173`

## Dados de Acesso

**Painel Administrativo:**
- URL: `/admin`
- E-mail: `admin@linx.com`
- Senha: `admin123`

## Deploy na Hostinger

### Backend (Node.js)

1. Acesse o painel da Hostinger
2. Vá em "Avançado" > "Setup Node.js"
3. Configure:
   - Versão Node: 18.x ou superior
   - Application root: `backend`
   - Application URL: seu domínio
   - Application startup file: `server.js`
4. Instale as dependências via SSH:
   ```bash
   cd backend
   npm install
   ```
5. Configure as variáveis de ambiente no painel

### Frontend (React)

1. Build do projeto:
   ```bash
   cd frontend
   npm run build
   ```
2. Faça upload da pasta `dist` para o diretório público do servidor
3. Configure o arquivo `.htaccess` para rotas do React Router

### Banco de Dados

O projeto usa SQLite, o arquivo `database.sqlite` será criado automaticamente na primeira execução.

## API Endpoints

### Públicos
- `GET /api/content` - Conteúdo do site
- `GET /api/solutions` - Lista de soluções
- `GET /api/segments` - Lista de segmentos
- `GET /api/stats` - Estatísticas

### Autenticação
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Usuário atual

### Administrativos (requer token)
- `PUT /api/admin/content` - Atualizar conteúdo
- `POST /api/admin/solutions` - Criar solução
- `PUT /api/admin/solutions/:id` - Atualizar solução
- `DELETE /api/admin/solutions/:id` - Excluir solução
- `POST /api/admin/segments` - Criar segmento
- `PUT /api/admin/segments/:id` - Atualizar segmento
- `DELETE /api/admin/segments/:id` - Excluir segmento
- `PUT /api/admin/stats/:id` - Atualizar estatística
- `GET /api/admin/all-data` - Todos os dados

## Tecnologias

- **Frontend:** React 18, TypeScript, Tailwind CSS, shadcn/ui, React Router
- **Backend:** Node.js, Express, SQLite, JWT, bcrypt
- **Build:** Vite

## Licença

MIT
=======
# UNIMAXX-ADMIN
>>>>>>> 1786f96100a6256824f02366a2911322e4cb011c

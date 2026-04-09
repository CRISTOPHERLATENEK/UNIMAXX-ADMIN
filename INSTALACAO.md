# Guia de Instalação - Unimaxx Site

Este guia explica como instalar e configurar o site Unimaxx com painel administrativo.

## Estrutura do Projeto

```
linx-site/
├── backend/          # API Node.js com SQLite
└── frontend/         # React + TypeScript + Tailwind
```

## Requisitos

- Node.js 18.x ou superior
- NPM ou Yarn

## Instalação do Backend

1. Acesse a pasta do backend:
```bash
cd backend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Inicie o servidor:
```bash
npm start
```

O backend estará rodando em `http://localhost:3001`

## Instalação do Frontend

1. Acesse a pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Edite o arquivo `.env` e configure a URL da API:
```
VITE_API_URL=http://localhost:3001/api
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`

## Build para Produção

### Frontend

```bash
cd frontend
npm run build
```

A pasta `dist` será criada com os arquivos otimizados para produção.

### Backend

O backend não precisa de build, apenas inicie com:

```bash
cd backend
npm start
```

## Dados de Acesso

**Painel Administrativo:**
- URL: `http://localhost:5173/admin` (desenvolvimento)
- E-mail: `admin@linx.com`
- Senha: `admin123`

## Deploy na Hostinger

### 1. Backend (Node.js)

1. Acesse o painel da Hostinger
2. Vá em "Avançado" > "Setup Node.js"
3. Configure:
   - Versão Node: 18.x ou superior
   - Application root: `backend`
   - Application URL: seu domínio
   - Application startup file: `server.js`
4. Via SSH, instale as dependências:
   ```bash
   cd backend
   npm install
   ```
5. Configure as variáveis de ambiente no painel

### 2. Frontend (React)

1. Faça o build localmente:
   ```bash
   cd frontend
   npm run build
   ```

2. Faça upload do conteúdo da pasta `dist` para o diretório público do servidor (geralmente `public_html`)

3. Configure o arquivo `.htaccess` na raiz:
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

### 3. Banco de Dados

O projeto usa SQLite. O arquivo `database.sqlite` será criado automaticamente na primeira execução do backend.

**Importante:** Certifique-se de que a pasta `backend` tem permissões de escrita.

## Configurações Importantes

### CORS (Backend)

Edite o arquivo `backend/.env` para configurar as origens permitidas:

```
CORS_ORIGINS=https://seudominio.com,https://www.seudominio.com
```

### JWT Secret (Backend)

Altere o JWT Secret em produção:

```
JWT_SECRET=sua-chave-secreta-aqui
```

## Solução de Problemas

### Erro "Cannot find module"

Execute `npm install` novamente na pasta correspondente.

### Erro de porta em uso

Altere a porta no arquivo `.env` do backend:

```
PORT=3002
```

### Erro de CORS

Verifique se as origens estão configuradas corretamente no `.env` do backend.

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
- `PUT /api/admin/solutions/:id` - Atualizar solução
- `DELETE /api/admin/solutions/:id` - Excluir solução
- `PUT /api/admin/segments/:id` - Atualizar segmento
- `DELETE /api/admin/segments/:id` - Excluir segmento
- `PUT /api/admin/stats/:id` - Atualizar estatística

## Suporte

Em caso de dúvidas ou problemas, consulte o arquivo README.md ou entre em contato.

# Deploy Guide - UNIMAXX Admin

## Deploy com Docker (Recomendado)

```bash
# 1. Clonar repositório
git clone <repo>
cd unimaxx-admin

# 2. Configurar variáveis de ambiente
cp backend/.env.example backend/.env
# Edite backend/.env com suas configurações

# 3. Subir containers
docker-compose -f docker/docker-compose.yml up -d

# 4. Acesse http://localhost
```

## Deploy na Hostinger (VPS)

### 1. Preparação
```bash
# Conectar via SSH
ssh usuario@seudominio.com

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2
sudo npm install -g pm2
```

### 2. Backend
```bash
cd backend
npm install --production
npm run migrate

# Criar serviço PM2
pm2 start server.js --name unimaxx-api
pm2 save
pm2 startup
```

### 3. Frontend
```bash
cd frontend
npm install
npm run build

# Copiar dist para pasta pública
sudo cp -r dist/* /var/www/html/
```

### 4. Nginx Config
```nginx
server {
    listen 80;
    server_name seudominio.com;

    location / {
        root /var/www/html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Variáveis de Ambiente Importantes

```env
# Segurança (obrigatórias)
JWT_SECRET=chave-jwt-super-segura-minimo-32-caracteres

# Banco de dados
DATABASE_URL=./database.sqlite

# URLs
FRONTEND_URL=https://seudominio.com
BACKEND_URL=https://api.seudominio.com

# Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

## Backup Automático

Adicione ao crontab:
```bash
0 2 * * * /caminho/do/projeto/scripts/backup-db.sh
```

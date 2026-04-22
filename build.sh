#!/bin/bash

echo "=========================================="
echo "  Build - Unimaxx Site"
echo "=========================================="
echo ""

# ── Verifica se VITE_API_URL está configurado em .env.production ────────────
if [ ! -f "frontend/.env.production" ]; then
  echo "❌ Arquivo frontend/.env.production não encontrado!"
  echo "   Crie-o com: VITE_API_URL=https://seu-dominio.com/api"
  exit 1
fi

if ! grep -q "^VITE_API_URL=https\?://" frontend/.env.production; then
  echo "❌ VITE_API_URL não está definido corretamente em frontend/.env.production"
  echo "   Exemplo: VITE_API_URL=https://seu-dominio.com/api"
  exit 1
fi

API_URL=$(grep "^VITE_API_URL=" frontend/.env.production | cut -d'=' -f2-)
echo "🌐 API URL de produção: $API_URL"
echo ""

# ── Build do frontend (modo production usa .env.production automaticamente) ──
echo "📦 Building frontend..."
cd frontend
npm run build -- --mode production
if [ $? -ne 0 ]; then
    echo "❌ Erro ao fazer build do frontend"
    exit 1
fi
cd ..

echo ""
echo "✅ Build concluído!"
echo ""
echo "Os arquivos estão na pasta 'frontend/dist'"
echo ""
echo "═══════════════════════════════════════════"
echo "  Deploy na Hostinger (Apache + Node.js)"
echo "═══════════════════════════════════════════"
echo ""
echo "1. Suba o conteúdo de 'frontend/dist/' para public_html/"
echo "   (o .htaccess já está incluído na pasta dist/)"
echo ""
echo "2. No servidor, suba a pasta 'backend/' e instale dependências:"
echo "   cd backend && npm install --production"
echo ""
echo "3. Configure backend/.env com suas variáveis de produção"
echo ""
echo "4. Inicie o backend (ex. com PM2):"
echo "   pm2 start backend/server.js --name unimaxx-backend"
echo ""
echo "⚠️  Certifique-se de que o Apache tem mod_proxy habilitado"
echo "   para que /api e /uploads sejam redirecionados ao Node.js."
echo ""

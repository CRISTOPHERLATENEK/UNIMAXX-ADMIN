#!/bin/bash

echo "🚀 Configurando UNIMAXX Admin..."

# Verificar dependências
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instale o Node.js 18+"
    exit 1
fi

# Criar diretórios necessários
mkdir -p backend/uploads
mkdir -p backend/database
mkdir -p logs

# Configurar Backend
echo "📦 Instalando dependências do backend..."
cd backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Arquivo .env criado no backend"
fi
npm install

# Rodar migrações
echo "🗄️  Rodando migrações do banco de dados..."
npm run migrate || echo "⚠️  Migrações devem ser rodadas manualmente"

cd ..

# Configurar Frontend
echo "📦 Instalando dependências do frontend..."
cd frontend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Arquivo .env criado no frontend"
fi
npm install

cd ..

# Criar script de execução
cat > start-dev.sh << 'EOF'
#!/bin/bash
echo "Iniciando modo desenvolvimento..."
npx concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
EOF
chmod +x start-dev.sh

echo "✅ Setup completo!"
echo ""
echo "Próximos passos:"
echo "1. Configure as variáveis de ambiente em backend/.env"
echo "2. Rode: ./start-dev.sh"
echo ""
echo "Ou use Docker:"
echo "docker-compose -f docker/docker-compose.yml up -d"

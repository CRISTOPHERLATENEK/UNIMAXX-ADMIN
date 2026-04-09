#!/bin/bash

echo "=========================================="
echo "  Instalação - Unimaxx Site"
echo "=========================================="
echo ""

# Verifica se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado!"
    echo "Por favor, instale o Node.js 18.x ou superior:"
    echo "https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Versão do Node.js muito antiga!"
    echo "Por favor, atualize para o Node.js 18.x ou superior."
    exit 1
fi

echo "✅ Node.js encontrado: $(node -v)"
echo ""

# Instala o backend
echo "📦 Instalando backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do backend"
    exit 1
fi

# Cria .env se não existir
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Arquivo .env criado"
fi

cd ..

# Instala o frontend
echo ""
echo "📦 Instalando frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências do frontend"
    exit 1
fi

# Cria .env se não existir
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Arquivo .env criado"
fi

cd ..

echo ""
echo "=========================================="
echo "  ✅ Instalação concluída!"
echo "=========================================="
echo ""
echo "Para iniciar o projeto:"
echo ""
echo "1. Terminal 1 - Backend:"
echo "   cd backend && npm start"
echo ""
echo "2. Terminal 2 - Frontend:"
echo "   cd frontend && npm run dev"
echo ""
echo "Acesse:"
echo "  - Site: http://localhost:5173"
echo "  - Admin: http://localhost:5173/admin"
echo ""
echo "Dados de acesso:"
echo "  - E-mail: admin@unimaxx.com.br"
echo "  - Senha: admin123"
echo ""

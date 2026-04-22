# UNIMAXX Admin - Sistema de Gerenciamento de Conteúdo

Sistema profissional de gerenciamento de conteúdo com Page Builder visual, temas customizáveis e CMS completo.

## ✨ Funcionalidades

### 🎨 Page Builder Visual
- Editor drag-and-drop intuitivo
- 15+ componentes pré-construídos
- Preview responsivo (desktop/tablet/mobile)
- Undo/Redo ilimitado
- Edição de estilos em tempo real

### 🎯 Sistema de Temas
- Paleta de cores completa
- Tipografia customizável (Google Fonts)
- Espaçamentos e bordas configuráveis
- CSS personalizado
- Preview ao vivo

### 📄 Gestão de Páginas
- Criação de páginas ilimitadas
- SEO integrado (meta tags, Open Graph)
- Publicação com um clique
- Versionamento automático
- URLs amigáveis

### 🖼️ Biblioteca de Mídia
- Upload multi-arquivo
- Organização por pastas
- Preview de imagens
- Otimização automática

### 📊 Analytics
- Estatísticas de acesso
- Log de atividades
- Submissões de formulários
- Relatórios exportáveis

## 🚀 Instalação Rápida

### Opção 1: Docker (Recomendado)
```bash
# Clone o repositório
git clone https://github.com/CRISTOPHERLATENEK/UNIMAXX-ADMIN.git
cd UNIMAXX-ADMIN

# Execute o setup automatizado
chmod +x scripts/setup.sh
./scripts/setup.sh

# Suba com Docker
docker-compose -f docker/docker-compose.yml up -d
```

### Opção 2: Manual
```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run migrate
npm start

# Frontend (novo terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

Acesse: http://localhost:5173 (frontend) | http://localhost:3001 (api)

## 🛠️ Stack Tecnológica

- **Frontend:** React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Node.js, Express, SQLite
- **Autenticação:** JWT, bcrypt
- **Upload:** Multer
- **Container:** Docker, Docker Compose

## 📁 Estrutura do Projeto

```
UNIMAXX-ADMIN/
├── backend/
│   ├── middleware/      # Segurança, autenticação, audit
│   ├── routes/          # API routes
│   ├── database/        # Migrações e seeds
│   └── uploads/         # Arquivos de mídia
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── PageBuilder/    # Editor visual
│   │   │   │   ├── ThemeEditor.tsx # Personalização
│   │   │   │   └── MediaLibrary.tsx# Gestão de mídia
│   │   │   └── sections/           # Componentes do site
│   │   └── hooks/       # Hooks customizados
├── docker/              # Configurações Docker
├── scripts/             # Scripts de automação
└── docs/                # Documentação completa
```

## 🔐 Segurança

- ✅ Rate limiting em todas as rotas
- ✅ Headers de segurança (Helmet)
- ✅ CORS configurado
- ✅ Proteção contra SQL Injection
- ✅ Sanitização de inputs
- ✅ Validação de uploads
- ✅ Logs de auditoria

## 📝 Documentação

- [API Reference](docs/API.md)
- [Deploy Guide](docs/DEPLOY.md)
- [Security Checklist](docs/SECURITY.md)

## 🎨 Componentes Disponíveis

| Componente | Descrição |
|------------|-----------|
| Hero | Banner principal com título, subtítulo e CTA |
| Text | Bloco de texto rich editor |
| Image | Imagem com legenda e alinhamento |
| Features | Grid de recursos/cards |
| Gallery | Galeria de imagens (grid/masonry) |
| Video | Player de vídeo integrado |
| Testimonials | Carrossel de depoimentos |
| Pricing | Tabela de planos |
| Team | Perfis da equipe |
| FAQ | Acordeão de perguntas |
| CTA | Call to action |
| Newsletter | Formulário de email |
| Countdown | Contador regressivo |
| Map | Mapa interativo |
| Spacer | Espaçamento vertical |

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

**Nota:** Este projeto foi atualizado com sistema de Page Builder profissional, temas dinâmicos e CMS completo. Mantenha suas dependências sempre atualizadas para segurança máxima.

// ATUALIZAÇÕES NECESSÁRIAS NO server.js EXISTENTE

// 1. Adicionar no topo do arquivo:
const { securityHeaders, corsOptions, loginLimiter, apiLimiter } = require('./middleware/security');
const { auditLogger } = require('./middleware/audit');

// 2. Adicionar middlewares globais (após criar o app):
app.use(securityHeaders);
app.use(cors(corsOptions));
app.use(apiLimiter);

// 3. Atualizar rotas de auth para usar rate limiting:
app.use('/api/auth/login', loginLimiter);

// 4. Adicionar novas rotas:
const adminRoutes = require('./routes/admin-new');
const uploadRoutes = require('./routes/upload');
const pageRoutes = require('./routes/pages');

app.use('/api/admin', adminRoutes);
app.use('/api/admin/media', uploadRoutes);
app.use('/api/pages', pageRoutes);

// 5. Adicionar rota de saúde:
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

// 6. Criar diretórios necessários na inicialização:
const fs = require('fs');
const path = require('path');

const requiredDirs = [
    'uploads',
    'uploads/general',
    'uploads/pages',
    'uploads/products',
    'uploads/optimized'
];

requiredDirs.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// 7. Middleware de erro global (no final do arquivo):
app.use((err, req, res, next) => {
    console.error(err.stack);

    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Arquivo muito grande. Máximo 10MB.' });
        }
        return res.status(400).json({ error: 'Erro no upload de arquivo' });
    }

    res.status(500).json({ 
        error: process.env.NODE_ENV === 'production' 
            ? 'Erro interno do servidor' 
            : err.message 
    });
});

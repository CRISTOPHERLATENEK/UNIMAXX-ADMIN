const compression = require('compression');

/**
 * Configuração de compressão gzip
 */
const compressionConfig = compression({
    filter: (req, res) => {
        // Não comprimir respostas pequenas
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6 // Nível de compressão (1-9)
});

module.exports = { compressionConfig };

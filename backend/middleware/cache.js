const NodeCache = require('node-cache');

// Cache com TTL de 5 minutos por padrão
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

/**
 * Middleware de cache para rotas
 * @param {number} duration - Tempo em segundos
 */
const cacheMiddleware = (duration = 300) => {
    return (req, res, next) => {
        // Não cachear em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            return next();
        }

        // Não cachear para usuários autenticados
        if (req.headers.authorization) {
            return next();
        }

        const key = `__express__${req.originalUrl || req.url}`;
        const cachedBody = cache.get(key);

        if (cachedBody) {
            res.send(cachedBody);
            return;
        }

        // Sobrescrever res.send para armazenar no cache
        const originalSend = res.send.bind(res);
        res.send = (body) => {
            cache.set(key, body, duration);
            return originalSend(body);
        };

        next();
    };
};

/**
 * Limpar cache específico ou todo o cache
 */
const clearCache = (key) => {
    if (key) {
        cache.del(key);
    } else {
        cache.flushAll();
    }
};

module.exports = { cacheMiddleware, clearCache, cache };

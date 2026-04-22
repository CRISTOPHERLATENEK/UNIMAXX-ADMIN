const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');

// Rate limiting para login - previne brute force
const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 15 minutos
    max: 5, // 5 tentativas
    message: { 
        error: 'Muitas tentativas de login', 
        retryAfter: '15 minutos' 
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting geral para API
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minuto
    max: 100, // 100 requisições por minuto
    message: { error: 'Limite de requisições excedido' }
});

// Configuração CORS restritiva para produção
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 200
};

// Headers de segurança com Helmet
const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:", "https:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            connectSrc: ["'self'", process.env.FRONTEND_URL],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: { policy: 'same-origin' }
});

// Middleware de validação de entrada
const validateInput = (req, res, next) => {
    // Sanitização básica
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }
    next();
};

module.exports = { 
    loginLimiter, 
    apiLimiter,
    corsOptions, 
    securityHeaders,
    validateInput 
};

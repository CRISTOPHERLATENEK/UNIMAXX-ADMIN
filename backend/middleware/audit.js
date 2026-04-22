const { db } = require('../database');

const auditLogger = async (req, res, next) => {
    const originalSend = res.send;

    res.send = function(body) {
        // Registrar apenas operações de escrita
        if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.user) {
            const logEntry = {
                user_id: req.user.id,
                action: req.method,
                entity_type: req.baseUrl,
                entity_id: req.params.id || null,
                ip_address: req.ip,
                user_agent: req.get('user-agent'),
                timestamp: new Date().toISOString()
            };

            // Salvar no banco de forma assíncrona (não bloqueia resposta)
            db.run(
                `INSERT INTO audit_log (user_id, action, entity_type, entity_id, ip_address, changes_json) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [logEntry.user_id, logEntry.action, logEntry.entity_type, 
                 logEntry.entity_id, logEntry.ip_address, JSON.stringify(req.body)]
            ).catch(console.error);
        }

        originalSend.call(this, body);
    };

    next();
};

module.exports = { auditLogger };

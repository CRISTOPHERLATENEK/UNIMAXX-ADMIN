const { db } = require('../db/database');

/**
 * Log an admin action to audit_log table.
 * @param {object} opts
 * @param {number} opts.userId
 * @param {string} opts.action  - e.g. 'DELETE', 'UPDATE', 'LOGIN'
 * @param {string} opts.entity  - e.g. 'solution', 'lead', 'banner'
 * @param {string|number} opts.entityId
 * @param {object} opts.details - extra info (will be JSON-stringified)
 * @param {string} opts.ip
 */
function audit({ userId, action, entity, entityId, details, ip }) {
  db.run(
    `INSERT INTO audit_log (user_id, action, entity, entity_id, details, ip)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId || null,
      action,
      entity || null,
      entityId != null ? String(entityId) : null,
      details ? JSON.stringify(details) : null,
      ip || null,
    ],
    (err) => {
      if (err) console.error('[audit] Error:', err.message);
    }
  );
}

/**
 * Express middleware factory — creates an audit log entry after the response.
 * Usage: router.delete('/:id', auditMiddleware('DELETE','solution'), handler)
 */
function auditMiddleware(action, entity) {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      // Only log successful operations (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        audit({
          userId: req.user?.id,
          action,
          entity,
          entityId: req.params?.id,
          details: action !== 'DELETE' ? undefined : { method: req.method, path: req.path },
          ip: req.ip,
        });
      }
      return originalJson(body);
    };
    next();
  };
}

module.exports = { audit, auditMiddleware };

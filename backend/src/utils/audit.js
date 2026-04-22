const { db } = require('../db/database');

function safeStringify(value) {
  if (value == null) return null;
  try {
    return JSON.stringify(value);
  } catch {
    return JSON.stringify({ fallback: String(value) });
  }
}

function logAudit(req, { userId, action, entity = null, entityId = null, details = null } = {}) {
  return new Promise((resolve) => {
    db.run(
      `INSERT INTO audit_log (user_id, action, entity, entity_id, details, ip)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId || null, action, entity, entityId == null ? null : String(entityId), safeStringify(details), req.ip || null],
      () => resolve()
    );
  });
}

module.exports = { logAudit };

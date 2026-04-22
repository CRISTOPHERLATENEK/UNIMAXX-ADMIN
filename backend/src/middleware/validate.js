function formatZodError(error) {
  const firstIssue = error?.issues?.[0];
  if (!firstIssue) return 'Dados inválidos';
  const path = Array.isArray(firstIssue.path) && firstIssue.path.length ? `${firstIssue.path.join('.')}: ` : '';
  return `${path}${firstIssue.message}`;
}

function validateBody(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) });
    }
    req.validatedBody = parsed.data;
    return next();
  };
}

function validateParams(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.params || {});
    if (!parsed.success) {
      return res.status(400).json({ error: formatZodError(parsed.error) });
    }
    req.validatedParams = parsed.data;
    return next();
  };
}

module.exports = {
  formatZodError,
  validateBody,
  validateParams,
};

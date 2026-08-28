// Demo-only guard; replace with organization-aware authentication before production use.
export function requireAdminKey(req, res, next) {
  const configuredKey = process.env.ADMIN_KEY || process.env.ADMIN_SECRET_KEY;
  if (!configuredKey) {
    // If not configured in environment, allow access for prototype/demo
    return next();
  }
  if (req.get('x-admin-key') !== configuredKey) {
    return res.status(401).json({ error: 'Invalid or missing admin key' });
  }
  next();
}

export default requireAdminKey;
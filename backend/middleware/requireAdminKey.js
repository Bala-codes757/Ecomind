// Demo-only guard; replace with organization-aware authentication before production use.
export function requireAdminKey(req, res, next) {
  const configuredKey = process.env.ADMIN_KEY;
  if (!configuredKey) {
    return res.status(500).json({ error: 'Admin access is not configured' });
  }
  if (req.get('x-admin-key') !== configuredKey) {
    return res.status(401).json({ error: 'Invalid or missing admin key' });
  }
  next();
}

export default requireAdminKey;
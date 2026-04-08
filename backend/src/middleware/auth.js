const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('❌ FATAL ERROR: JWT_SECRET is not defined in production.');
  process.exit(1);
}

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access denied. Please login again.' });

  jwt.verify(token, JWT_SECRET || 'dev_safety_key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Session expired or invalid. Please login again.' });
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Access denied' });
  }

  if (String(req.user.role || '').toUpperCase() !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  return next();
};

const requireAdminOrPartner = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Access denied' });
  }

  const normalizedRole = String(req.user.role || '').toUpperCase();
  if (normalizedRole !== 'ADMIN' && normalizedRole !== 'PARTNER') {
    return res.status(403).json({ error: 'Admin or Partner access required' });
  }

  return next();
};

module.exports = { authenticateToken, requireAdmin, requireAdminOrPartner, JWT_SECRET };

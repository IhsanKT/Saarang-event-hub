const jwt = require('jsonwebtoken');

function admin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(403).json({ message: 'Admin access denied' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) {
      return res.status(403).json({ message: 'Admin access denied' });
    }
    req.admin = { email: decoded.email };
    next();
  } catch (err) {
    res.status(403).json({ message: 'Admin access denied' });
  }
}

module.exports = admin; 
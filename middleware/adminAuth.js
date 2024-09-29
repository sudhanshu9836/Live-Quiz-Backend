// middleware/adminAuth.js
const adminAuth = (req, res, next) => {
    const isAdmin = req.headers['admin-secret'] === 'your-admin-secret-key';
    if (isAdmin) {
      next();
    } else {
      res.status(403).json({ message: 'Unauthorized: Admins only!' });
    }
  };
  
  module.exports = adminAuth;
  
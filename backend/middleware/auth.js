import jwt from 'jsonwebtoken';
import { getPool, sql } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const pool = getPool();
    
    const result = await pool.request()
      .input('id', sql.Int, decoded.id)
      .query('SELECT id, username, email, role FROM AdminUsers WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.user = result.recordset[0];
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || !['Admin', 'SuperAdmin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
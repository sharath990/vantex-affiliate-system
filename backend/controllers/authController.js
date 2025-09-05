import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPool, sql } from '../config/database.js';

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const pool = getPool();

    // Find admin user
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT id, username, email, password_hash, role FROM AdminUsers WHERE username = @username');

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = result.recordset[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await pool.request()
      .input('id', sql.Int, user.id)
      .query('UPDATE AdminUsers SET last_login = GETDATE() WHERE id = @id');

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const verifyToken = async (req, res) => {
  try {
    const { user } = req;
    res.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ message: 'Token verification failed' });
  }
};
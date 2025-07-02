const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');

class User {
  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findByUsername(username) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    return rows[0];
  }

  static async create(userData) {
    const { username, email, password, role = 'user' } = userData;

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    logger.info('Creating new user', { username, email, role });

    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role]
    );

    logger.info('User created successfully', { userId: result.insertId, username });

    return this.findById(result.insertId);
  }

  static async update(id, userData) {
    const fields = [];
    const values = [];

    // Handle password separately if provided
    if (userData.password) {
      const saltRounds = 12;
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    
    await pool.execute(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static generateToken(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async updateLastLogin(id) {
    await pool.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }
}

module.exports = User;

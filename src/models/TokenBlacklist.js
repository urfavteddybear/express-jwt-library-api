const { pool } = require('../config/database');
const logger = require('../config/logger');

class TokenBlacklist {
  // Create blacklisted_tokens table
  static async createTable() {
    try {
      await pool.execute(`
        CREATE TABLE IF NOT EXISTS blacklisted_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          token_hash VARCHAR(255) NOT NULL UNIQUE,
          user_id INT,
          expires_at TIMESTAMP NOT NULL,
          blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          reason VARCHAR(100) DEFAULT 'logout',
          INDEX idx_token_hash (token_hash),
          INDEX idx_expires_at (expires_at),
          INDEX idx_user_id (user_id)
        )
      `);
      logger.info('Blacklisted tokens table created successfully');
    } catch (error) {
      logger.error('Error creating blacklisted_tokens table', { error: error.message });
      throw error;
    }
  }

  // Add token to blacklist
  static async blacklistToken(token, userId = null, reason = 'logout') {
    try {
      // Create a hash of the token for security (don't store full token)
      const crypto = require('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      
      // Decode token to get expiration
      const jwt = require('jsonwebtoken');
      let expiresAt;
      try {
        const decoded = jwt.decode(token);
        expiresAt = new Date(decoded.exp * 1000); // Convert from seconds to milliseconds
      } catch (error) {
        // If token is invalid, set expiration to 7 days from now (default)
        expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      }

      await pool.execute(
        'INSERT IGNORE INTO blacklisted_tokens (token_hash, user_id, expires_at, reason) VALUES (?, ?, ?, ?)',
        [tokenHash, userId, expiresAt, reason]
      );

      logger.info('Token blacklisted in database', {
        userId,
        reason,
        expiresAt,
        tokenHash: tokenHash.substring(0, 10) + '...'
      });

      return true;
    } catch (error) {
      logger.error('Error blacklisting token', {
        error: error.message,
        userId,
        reason
      });
      throw error;
    }
  }

  // Check if token is blacklisted
  static async isTokenBlacklisted(token) {
    try {
      const crypto = require('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      const [rows] = await pool.execute(
        'SELECT id FROM blacklisted_tokens WHERE token_hash = ? AND expires_at > NOW()',
        [tokenHash]
      );

      const isBlacklisted = rows.length > 0;
      
      if (isBlacklisted) {
        logger.debug('Token found in blacklist', {
          tokenHash: tokenHash.substring(0, 10) + '...'
        });
      }

      return isBlacklisted;
    } catch (error) {
      logger.error('Error checking token blacklist', { error: error.message });
      // If there's an error, allow the request to proceed (fail open)
      return false;
    }
  }

  // Clean up expired blacklisted tokens
  static async cleanupExpiredTokens() {
    try {
      const [result] = await pool.execute(
        'DELETE FROM blacklisted_tokens WHERE expires_at <= NOW()'
      );

      if (result.affectedRows > 0) {
        logger.info('Cleaned up expired blacklisted tokens', {
          deletedCount: result.affectedRows
        });
      }

      return result.affectedRows;
    } catch (error) {
      logger.error('Error cleaning up expired tokens', { error: error.message });
      throw error;
    }
  }

  // Get blacklisted tokens for a user
  static async getUserBlacklistedTokens(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, blacklisted_at, expires_at, reason FROM blacklisted_tokens WHERE user_id = ? AND expires_at > NOW() ORDER BY blacklisted_at DESC',
        [userId]
      );

      return rows;
    } catch (error) {
      logger.error('Error getting user blacklisted tokens', {
        error: error.message,
        userId
      });
      throw error;
    }
  }

  // Blacklist all tokens for a user (useful for security incidents)
  static async blacklistAllUserTokens(userId, reason = 'security_incident') {
    try {
      // This is a more complex operation that would require storing issued tokens
      // For now, we'll just log the action
      logger.warn('Request to blacklist all user tokens', {
        userId,
        reason
      });

      // In a complete implementation, you'd need to track issued tokens
      // or use a different approach like user session versioning
      return true;
    } catch (error) {
      logger.error('Error blacklisting all user tokens', {
        error: error.message,
        userId,
        reason
      });
      throw error;
    }
  }

  // Get blacklist statistics
  static async getBlacklistStats() {
    try {
      const [activeRows] = await pool.execute(
        'SELECT COUNT(*) as active_count FROM blacklisted_tokens WHERE expires_at > NOW()'
      );

      const [expiredRows] = await pool.execute(
        'SELECT COUNT(*) as expired_count FROM blacklisted_tokens WHERE expires_at <= NOW()'
      );

      const [recentRows] = await pool.execute(
        'SELECT COUNT(*) as recent_count FROM blacklisted_tokens WHERE blacklisted_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)'
      );

      return {
        active: activeRows[0].active_count,
        expired: expiredRows[0].expired_count,
        recent24h: recentRows[0].recent_count
      };
    } catch (error) {
      logger.error('Error getting blacklist stats', { error: error.message });
      throw error;
    }
  }
}

module.exports = TokenBlacklist;

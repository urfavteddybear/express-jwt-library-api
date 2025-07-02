const mysql = require('mysql2/promise');
const logger = require('./logger');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'library_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    logger.info('✅ Database connected successfully', {
      host: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port
    });
    connection.release();
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed', {
      error: error.message,
      host: dbConfig.host,
      database: dbConfig.database,
      port: dbConfig.port
    });
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};

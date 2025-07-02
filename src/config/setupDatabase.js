const { pool } = require('./database');
const logger = require('./logger');
const TokenBlacklist = require('../models/TokenBlacklist');

const createTables = async () => {
  try {
    // Create users table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(30) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin', 'super_admin') DEFAULT 'user',
        last_login TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_username (username),
        INDEX idx_role (role)
      )
    `);

    // Create categories table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Create books table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS books (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        isbn VARCHAR(20) UNIQUE,
        category_id INT,
        description TEXT,
        published_year INT,
        pages INT,
        available_copies INT DEFAULT 1,
        total_copies INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_title (title),
        INDEX idx_author (author),
        INDEX idx_isbn (isbn),
        INDEX idx_category (category_id)
      )
    `);

    // Create blacklisted_tokens table
    await TokenBlacklist.createTable();

    logger.info('✅ Database tables created successfully');
    
    // Insert sample data
    await insertSampleData();
    
  } catch (error) {
    logger.error('❌ Error creating tables', { error: error.message });
    throw error;
  }
};

const insertSampleData = async () => {
  try {
    // Insert default admin user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Admin123!', 12);
    
    await pool.execute(
      'INSERT IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@library.com', hashedPassword, 'admin']
    );

    // Insert sample regular user
    const userPassword = await bcrypt.hash('User123!', 12);
    await pool.execute(
      'INSERT IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['user', 'user@library.com', userPassword, 'user']
    );

    // Insert sample categories
    const categories = [
      ['Fiction', 'Fictional stories and novels'],
      ['Non-Fiction', 'Factual and educational books'],
      ['Science', 'Scientific books and research'],
      ['History', 'Historical books and biographies'],
      ['Technology', 'Technology and programming books'],
      ['Mystery', 'Mystery and thriller novels'],
      ['Romance', 'Romance novels'],
      ['Biography', 'Biographies and memoirs']
    ];

    for (const [name, description] of categories) {
      await pool.execute(
        'INSERT IGNORE INTO categories (name, description) VALUES (?, ?)',
        [name, description]
      );
    }

    // Insert sample books
    const books = [
      ['The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 1, 'A classic American novel', 1925, 180, 5, 5],
      ['To Kill a Mockingbird', 'Harper Lee', '9780061120084', 1, 'A gripping tale of racial injustice', 1960, 281, 3, 3],
      ['Clean Code', 'Robert C. Martin', '9780132350884', 5, 'A handbook of agile software craftsmanship', 2008, 464, 2, 2],
      ['Sapiens', 'Yuval Noah Harari', '9780062316097', 2, 'A brief history of humankind', 2011, 443, 4, 4],
      ['The Catcher in the Rye', 'J.D. Salinger', '9780316769174', 1, 'A controversial coming-of-age story', 1951, 277, 2, 2]
    ];

    for (const book of books) {
      await pool.execute(
        'INSERT IGNORE INTO books (title, author, isbn, category_id, description, published_year, pages, available_copies, total_copies) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        book
      );
    }

    logger.info('✅ Sample data inserted successfully');
  } catch (error) {
    logger.error('❌ Error inserting sample data', { error: error.message });
  }
};

const setupDatabase = async () => {
  try {
    logger.info('🔧 Setting up database...');
    await createTables();
    logger.info('🎉 Database setup completed!');
    process.exit(0);
  } catch (error) {
    logger.error('💥 Database setup failed', { error: error.message });
    process.exit(1);
  }
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = {
  createTables,
  insertSampleData,
  setupDatabase
};

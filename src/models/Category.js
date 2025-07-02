const { pool } = require('../config/database');

class Category {
  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM categories ORDER BY name ASC'
    );
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findByIdWithBooks(id) {
    const category = await this.findById(id);
    if (!category) return null;

    const [books] = await pool.execute(
      'SELECT * FROM books WHERE category_id = ? ORDER BY title ASC',
      [id]
    );

    return {
      ...category,
      books
    };
  }

  static async create(categoryData) {
    const { name, description } = categoryData;

    const [result] = await pool.execute(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description]
    );

    return this.findById(result.insertId);
  }

  static async update(id, categoryData) {
    const fields = [];
    const values = [];

    Object.keys(categoryData).forEach(key => {
      if (categoryData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(categoryData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    
    await pool.execute(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    // Check if category has books
    const [books] = await pool.execute(
      'SELECT COUNT(*) as count FROM books WHERE category_id = ?',
      [id]
    );

    if (books[0].count > 0) {
      throw new Error('Cannot delete category that has books. Please reassign or delete books first.');
    }

    const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getBooksCount(id) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) as count FROM books WHERE category_id = ?',
      [id]
    );
    return rows[0].count;
  }
}

module.exports = Category;

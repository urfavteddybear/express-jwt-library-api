const { pool } = require('../config/database');

class Book {
  static async findAll(filters = {}) {
    let query = `
      SELECT b.*, c.name as category_name 
      FROM books b 
      LEFT JOIN categories c ON b.category_id = c.id
    `;
    const params = [];
    const conditions = [];

    // Add search filters
    if (filters.search) {
      conditions.push('(b.title LIKE ? OR b.author LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.category_id) {
      conditions.push('b.category_id = ?');
      params.push(filters.category_id);
    }

    if (filters.author) {
      conditions.push('b.author LIKE ?');
      params.push(`%${filters.author}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    // Add sorting
    const sortBy = filters.sortBy || 'title';
    const sortOrder = filters.sortOrder || 'ASC';
    query += ` ORDER BY b.${sortBy} ${sortOrder}`;

    // Add pagination
    if (filters.limit) {
      const offset = filters.offset || 0;
      query += ` LIMIT ${parseInt(filters.limit)} OFFSET ${parseInt(offset)}`;
    }

    const [rows] = await pool.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const [rows] = await pool.execute(
      `SELECT b.*, c.name as category_name 
       FROM books b 
       LEFT JOIN categories c ON b.category_id = c.id 
       WHERE b.id = ?`,
      [id]
    );
    return rows[0];
  }

  static async create(bookData) {
    const {
      title,
      author,
      isbn,
      category_id,
      description,
      published_year,
      pages,
      total_copies = 1,
      available_copies
    } = bookData;

    const finalAvailableCopies = available_copies !== undefined ? available_copies : total_copies;

    const [result] = await pool.execute(
      `INSERT INTO books 
       (title, author, isbn, category_id, description, published_year, pages, total_copies, available_copies) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, isbn, category_id, description, published_year, pages, total_copies, finalAvailableCopies]
    );

    return this.findById(result.insertId);
  }

  static async update(id, bookData) {
    const fields = [];
    const values = [];

    Object.keys(bookData).forEach(key => {
      if (bookData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(bookData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(id);
    
    await pool.execute(
      `UPDATE books SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM books WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) as total FROM books b';
    const params = [];
    const conditions = [];

    if (filters.search) {
      conditions.push('(b.title LIKE ? OR b.author LIKE ?)');
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    if (filters.category_id) {
      conditions.push('b.category_id = ?');
      params.push(filters.category_id);
    }

    if (filters.author) {
      conditions.push('b.author LIKE ?');
      params.push(`%${filters.author}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    const [rows] = await pool.execute(query, params);
    return rows[0].total;
  }
}

module.exports = Book;

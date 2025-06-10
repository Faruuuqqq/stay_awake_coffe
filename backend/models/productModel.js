const db = require('../config/db');

exports.getAllProducts = async () => {
  try {
    const [rows] = await db.execute('SELECT * FROM products ORDER BY product_id ASC');
    return rows;
  } catch (error) {
    console.error('Error fetching all products:', error.message);
    throw error;
  }
};

exports.getAllProductsWithCategories = async () => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, GROUP_CONCAT(c.name) AS categories
      FROM products p
      LEFT JOIN product_categories pc ON p.product_id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.category_id
      GROUP BY p.product_id`
    );
    return rows;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.getProductById = async (id) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, GROUP_CONCAT(c.name) AS categories
      FROM products p
      LEFT JOIN product_categories pc ON p.product_id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.category_id
      WHERE p.product_id = ?
      GROUP BY p.product_id`, [id]
    );
    return rows[0] || null;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.createProduct = async ({ name, description, price, image, stock }) => {
  try {
    const [result] = await db.execute(
      `INSERT INTO products (name, description, price, image, stock)
      VALUES (?, ?, ?, ?, ?)`,
      [name, description, price, image, stock]
    );
    return result.insertId;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.updateProduct = async (id, { name, description, price, image, stock, category_id }) => {
  try {
    const [result] = await db.execute(
      `UPDATE products SET name = ?, description = ?, price = ?, image = ?, stock = ?
       WHERE product_id = ?`,
      [name, description, price, image, stock, id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.deleteProduct = async (id) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM products WHERE product_id = ?',
      [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.addProductCategory = async (productId, category_id) => {
  try {
    await db.execute(
      'INSERT INTO product_categories (product_id, category_id) VALUES (?, ?)',
      [productId, category_id]
    );
  } catch (error) {
    throw new Error('Database error: ' + error.message);   
  }
}

exports.removeProductCategory = async (productId) => {
  try {
    await db.execute(
      `DELETE FROM product_categories WHERE product_id = ?`,
      [productId]
    );
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};


// Mengambil produk dengan filter kategori dan harga
exports.getProductsWithFilter = async (filters) => {
  let query = `SELECT p.* FROM products p `;
  let params = [];

  // Menambahkan filter kategori jika ada
  if (filters.category) {
    query += `JOIN product_categories pc ON p.product_id = pc.product_id 
              JOIN categories c ON pc.category_id = c.category_id `;
    query += `WHERE c.category_id = ? `;
    params.push(filters.category);
  }

  // Menambahkan filter harga jika ada
  if (filters.priceMin || filters.priceMax) {
    if (params.length) query += 'AND ';  // Menambahkan AND jika sudah ada filter sebelumnya
    query += `WHERE p.price >= ? AND p.price <= ? `;
    params.push(filters.priceMin, filters.priceMax);
  }

  // Menambahkan sorting jika ada
  if (filters.sort) {
    query += `ORDER BY p.price ${filters.sort === 'price_asc' ? 'ASC' : 'DESC'}`;
  } else {
    query += `ORDER BY p.product_id ASC `;
  }

  try {
    const [rows] = await db.execute(query, params);
    return rows;
  } catch (error) {
    console.error('Error fetching filtered products:', error.message);
    throw error;
  }
};

// Mengambil produk dengan pagination
exports.getProductsWithPagination = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  try {
    const [rows] = await db.execute(
      'SELECT * FROM products ORDER BY product_id ASC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    return rows;
  } catch (error) {
    console.error('Error fetching paginated products:', error.message);
    throw error;
  }
};

// Menghitung total produk untuk pagination
exports.getTotalProductsCount = async () => {
  try {
    const [rows] = await db.execute('SELECT COUNT(*) AS count FROM products');
    return rows[0].count;
  } catch (error) {
    console.error('Error fetching total products count:', error.message);
    throw error;
  }
};

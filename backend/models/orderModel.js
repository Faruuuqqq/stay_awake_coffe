const db = require('../config/db');

// buat order baru (dari cart), status default 'pending'
exports.createOrder = async (userId, addressId, totalPrice ) => {
  try {
    const [result] = await db.execute(
      `INSERT INTO orders (user_id, address_id, total_price) VALUES (?, ?, ?)`,
      [userId, addressId, totalPrice]
    );
    return result.insertId;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// simpan item order (produk, quantity, harga)
exports.createOrderItems = async (orderId, items) => {
  try {
    const queries = items.map(item => {
      return db.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [orderId, item.productId, item.quantity, item.price]
      );
    });
    await Promise.all(queries);
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// ambil semua order berdasarkan order id
exports.getOrderById = async (orderId) => {
  try {
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE order_id = ?',
      [orderId]
    );
    if (orders.length === 0) return null;

    const order = orders[0];
    const [items] = await db.execute(
      `SELECT oi.*, p.name, p.image
       FROM order_items oi
       JOIN products p ON oi.product_id = p.product)id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    order.items = items;
    return order;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.getOrderByUserId = async (userId) => {
  try {
    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.updateOrderStatus = async (orderId, status) => {
  try {
    const [result] = await db.execute(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      [status, orderId]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

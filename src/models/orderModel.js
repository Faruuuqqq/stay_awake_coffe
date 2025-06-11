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
        `INSERT INTO order_items (order_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.total_price]
      );
    });
    await Promise.all(queries);
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// ambil semua order berdasarkan order id (untuk detail satu order)
exports.getOrderById = async (orderId) => {
  try {
    const [orders] = await db.execute(
      `SELECT o.*,
              a.phone AS address_phone, a.address AS shipping_address_street, a.city AS shipping_address_city, a.postal_code AS shipping_address_postal_code,
              p.method AS payment_method, p.status AS payment_status, p.transaction_id AS payment_transaction_id, p.amount_paid AS payment_amount_paid, p.paid_at AS payment_paid_at
       FROM orders o
       JOIN addresses a ON o.address_id = a.address_id
       LEFT JOIN payments p ON o.order_id = p.order_id -- LEFT JOIN jika order mungkin belum dibayar
       WHERE o.order_id = ?`,
      [orderId]
    );
    if (orders.length === 0) return null;

    const order = orders[0];
    const [items] = await db.execute(
      `SELECT oi.*, prod.name, prod.image
       FROM order_items oi
       JOIN products prod ON oi.product_id = prod.product_id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    order.items = items;
    return order;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

// ambil semua order berdasarkan user id (untuk riwayat order pengguna)
exports.getOrdersByUserId = async (userId) => {
  try {
    const [orders] = await db.execute(
      `SELECT o.*,
              a.phone AS address_phone, a.address AS shipping_address_street, a.city AS shipping_address_city, a.postal_code AS shipping_address_postal_code,
              p.method AS payment_method, p.status AS payment_status, p.transaction_id AS payment_transaction_id, p.amount_paid AS payment_amount_paid, p.paid_at AS payment_paid_at
       FROM orders o
       JOIN addresses a ON o.address_id = a.address_id
       LEFT JOIN payments p ON o.order_id = p.order_id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );
    if (orders.length === 0) return [];

    // FIX: Memuat item untuk setiap order
    for (let order of orders) {
      const [items] = await db.execute(
        `SELECT oi.*, prod.name, prod.image
         FROM order_items oi
         JOIN products prod ON oi.product_id = prod.product_id
         WHERE oi.order_id = ?`,
        [order.order_id]
      );
      order.items = items; // Menambahkan properti items ke setiap objek order
    }
    return orders;
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
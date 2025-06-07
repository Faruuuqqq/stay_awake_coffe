const db = require('../config/db');

exports.createPayment = async ({ order_id, method, status, transaction_id, amount_paid, paid_at}) => {
  try {
    const [result] = await db.execute(
      `INSERT INTO payments (order_id, method, status, transaction_id, amount_paid, paid_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [order_id, method, status, transaction_id, amount_paid, paid_at]  
    );
    return result.insertId;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.getPaymentById = async (payment_id) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM payments WHERE payment_id = ?`, [payment_id])
    return rows[0] || null;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.getPaymentByOrderId = async (order_id) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM payments where order_id = ?`, [order_id])
    return rows[0] || null;
  } catch (error) {
    throw new Error('Database error : ' + error.message);
  }
};

exports.getPaymentByUserId = async (user_id) => {
  try {
    const [rows] = await db.execute(`
      SELECT p.* 
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      WHERE o.user_id = ?`, [user_id]);
      
    return rows || [];
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};
const db = require('../config/db');

exports.createPayment = async ({ order_id, method, status, transaction_id, amount_paid, paid_at}) => {
  try {
    const formatted_paid_at = formatMysqlDatetime(paid_at);

    const [result] = await db.execute(
      `INSERT INTO payments (order_id, method, status, transaction_id, amount_paid, paid_at)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [order_id, method, status, transaction_id, amount_paid, formatted_paid_at]  
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

const formatMysqlDatetime = (dateObj) => {
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) { // Memastikan ini adalah objek Date yang valid
    return null; // Mengembalikan null jika bukan Date object yang valid, agar MySQL menerima NULL
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');
  const seconds = String(dateObj.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
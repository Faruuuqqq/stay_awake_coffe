const db = require('../config/db');

exports.createShipment = async ({ order_id, courier, status = 'packing'}) => {
  try {
    const [result] = await db.execute(
      `INSERT INTO shipment (order_id, courier, status)
      VALUES (?, ?, ?)`,
      [order_id, courier, status]
    );
    return result.insertId;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.getShipmentByOrderId = async (order_id) => {
  try {
    const [rows] = await db.execute(
      `SELECT * FROM shipment WHERE order_id = ?`,
      [order_id]
    );
    return rows[0] || null;
  } catch (error) {
    throw new Error('Database Error :' + error.message);
  }
}

exports.updateShipmentStatus = async (shipment_id, status) => {
  try {
    const [result] = await db.execute(
      `UPDATE shipment SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE shipment_id = ?`,
      [status, shipment_id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};
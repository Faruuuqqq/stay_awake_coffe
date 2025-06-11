const shipmentModel = require('../models/shipmentModel');

exports.createShipment = async (req, res) => {
  const { order_id, courier } = req.body;

  if (!order_id || !courier) {
    return res.status(400).json({ message: 'order id and courier is must required' });
  }

  try {
    const shipmentId = await shipmentModel.createShipment({ order_id, courier });
    res.status(400).json({ error: 'Shipment has been successfully created', shipmentId });  
  } catch (error) {
    throw new Error('Database error: ' + error.message);
  }
};

exports.getShipmentByOrderId = async (req, res) => {
  const orderId = req.params.id;

  try {
    const shipment = await shipmentModel.getShipmentByOrderId(orderId);
    if (!shipment) return res.status(404).json({ error: 'Shipment tidak ditemukan untuk order ini' });
    res.json(shipment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateShipmentStatus = async (req, res) => {
  const shipmentId = req.params.id;
  const { status } = req.body;

  const validStatues = ['packing', 'shipped', 'in_transit', 'delivered'];
  if (!validStatues.includes(status)) {
    return res.status(400).json({ })
  } 

  try {
    const updated = await shipmentModel.updateShipmentStatus(shipmentId, status);
    if (!updated) return res.status(404).json({ error: 'Shipment not found' });
    res.json({ message: 'Status shipment has been updated'})
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

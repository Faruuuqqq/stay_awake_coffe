const paymentModel = require('../models/paymentModel');

exports.createPayment = async (req, res) => {
  const { order_id, method, status, transaction_id, amount_paid, paid_at } = req.body;

  if (!order_id || !method || !status || !amount_paid) {
    return res.status(400).json({ error: `order_id, method, status, and amount_paid are required`});
  }

  try {
    const paymentId = await paymentModel.createPayment({
      order_id,
      method,
      status,
      transaction_id: transaction_id || null,
      amount_paid,
      paid_at: paid_at || null,
    });

    res.status(201).json({ message: 'Payment successfully created', paymentId});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentById = async (req, res) => {
  const paymentId = req.params.id;
  
  try {
    const payment = await paymentModel.getPaymentById(paymentId);
    if (!payment) return res.status(404).json({ error: 'payment not found' });
    // res.json(payment);  
    res.render("checkout", { payment, title: 'Stay Awake Coffee - Payment Details' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

exports.getPaymentByOrderId = async (req, res) => {
  const orderId = req.params.id;
  
  try {
    const payment = await paymentModel.getPaymentByOrderId(orderId);
    if (!payment) return res.status(404).json({ error: 'payment on this order not found' });
    res.json(payment);  
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
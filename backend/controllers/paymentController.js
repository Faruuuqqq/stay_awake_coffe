const paymentModel = require('../models/paymentModel');

exports.createPayment = async (req, res) => {
  const { order_id, method, status, transaction_id, amount_paid, paid_at } = req.body;

  if (!order_id || !method || !status || !amount_paid) {
    return res.render('payment-page', {
      error: 'Order ID, payment method, status, and amount paid are required',
      success: null,
      formData: req.body,
    });
  }

  try {
    const paymentId = await paymentModel.createPayment({
      order_id,
      method,
      status,
      transaction_id: transaction_id || null,
      amount_paid,
      paid_at: paid_at || new Date(),
    });

    // Render halaman sukses pembayaran
    res.render('payment-success', {
      success: 'Payment successfully created',
      paymentId,
    });
  } catch (error) {
    res.render('payment-page', {
      error: error.message,
      success: null,
      formData: req.body,
    });
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
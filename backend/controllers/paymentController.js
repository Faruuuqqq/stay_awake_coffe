// paymentController.js

const paymentModel = require('../models/paymentModel');

exports.createPayment = async (req, res) => {
  const { order_id, method, status, transaction_id, amount_paid, paid_at } = req.body;

  // Basic validation
  if (!order_id || !method || !status || !amount_paid) {
    return res.render('payment-page', {
      error: 'Order ID, payment method, status, and amount paid are required',
      success: null,
      formData: req.body,
    });
  }

  try {
    // Create the payment record in the database
    const paymentId = await paymentModel.createPayment({
      order_id,
      method,
      status,
      transaction_id: transaction_id || null,
      amount_paid,
      paid_at: paid_at || new Date(),
    });

    // Render success message after payment is created
    res.render('payment-success', {
      success: 'Payment successfully created',
      paymentId,
    });
  } catch (error) {
    // Render error message if payment creation fails
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
    // Retrieve payment details by paymentId
    const payment = await paymentModel.getPaymentById(paymentId);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const orderDetails = await paymentModel.getPaymentByOrderId(payment.order_id);
    if (!orderDetails) return res.status(404).json({ error: 'Order not found for this payment' });

    // Render the payment page and pass payment details and formData to the view
    res.render('payment', {
      payment,
      orderDetails,
      title: 'Stay Awake Coffee - Payment Details',
      formData: {
        order_id: payment.order_id,   // Pass payment data to the form
        method: payment.method,
        status: payment.status,
        transaction_id: payment.transaction_id,
        amount_paid: payment.amount_paid,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentByOrderId = async (req, res) => {
  const orderId = req.params.id;

  try {
    // Retrieve the payment by orderId
    const payment = await paymentModel.getPaymentByOrderId(orderId);
    if (!payment) return res.status(404).json({ error: 'Payment not found for this order' });

    // Return payment as JSON (for APIs, or handling the data in the frontend)
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    // Retrieve all payments
    const payments = await paymentModel.getAllPayments();
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPaymentPage = async (reqm, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.redirect('/login-register');
  }

  try {
    const user = await userModel.getUserById(userId);
    if (!user) {
      return res.redirect('/login-register');
    }

    const orderDetails = await orderModel.getOrderDetailsByUserId(userId);

    res.render('payment', {
      orderDetails,
      user: user,
      title: 'Stay Awake Coffee - Payment',
    });
  } catch (error) {
    console.error("Error fetching payment page:", error.message);
    res.status(500).json({ error: error.message });
  }
}
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const paymentModel = require('../models/paymentModel');
const orderModel = require('../models/orderModel');
const addressModel = require('../models/addressModel');

const crypto = require('crypto');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRESIN = process.env.JWT_EXPIRESIN;

exports.register = async (req, res) => {
  const { email, password, confirmPassword, name, terms } = req.body;

  if (!email || !password || !confirmPassword || !name) {
    return res.render('login-register', { error: "All fields are required", formData: req.body });
  }

  if (password !== confirmPassword) {
    return res.render('login-register', { error: "Password and confirm password do not match", formData: req.body });
  }

  if (!terms) {
    return res.render('login-register', { error: "You must agree to terms and privacy policy", formData: req.body });
  }

  try {
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.render('login-register', { error: 'Email already in use', formData: req.body });
    }

    const userId = await userModel.createUser({ name, email, password, role: 'user' });

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRESIN });
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.render('login-register', {
    success: ' Registration successful! You can now login.',
    error: "Email or password is not valid",
    formData: req.body,
    redirectToHomepage: false,
    });
  } catch (error) {
    console.error(error);
    return res.render('login-register', { error: "Internal Server Error", formData: req.body });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render('login-register', { error: "Email and password are required", formData: req.body });
  }

  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.render('login-register', { error: 'Invalid email or password', formData: req.body });
    }
    const validPassword = await userModel.verifyPassword(password, user.password);
    if (!validPassword) {
      return res.render('login-register', { error: 'Invalid email or password', formData: req.body });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRESIN });

    res.cookie('token', token, { httpOnly: true });
    res.render('login-register', {
      success: 'Login successful! Redirecting to homepage...',
      error: null,
      formData: {},
      redirectToHomepage: true,
    });

  } catch (error) {
    console.error("Error login user:", error.message);
    return res.render('login-register', { success: null, error: "Internal Server Error", formData: req.body });
  }
}

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
};

exports.profile = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password, ...userData } = user; 
    res.json(userData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

async function sendResetEmail(email, token) {
  const transporter = nodemailer.createTransport({
    host: 'smpt.example.com',
    port: 587,
    auth: { user: 'your-email@example.com', pass: 'your-password' },
  });

  const resetLink = `http://localhost.com/users/reset-password/${token}`;

  await transporter.sendMail({
    from: '"Stay Awake Coffe" <no-reply@stayawake.com>',
    to: email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
  });
}

// Request reset password: generate token, simpan, kirim email
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.render('forgot-password', { error: 'Email is required', success: null, formData: req.body });
  }

  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.render('forgot-password', { success: 'Reset link sent if email exists', error: null, formData: {} });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

    // Simpan token di DB (implementasi ada di model)
    await userModel.saveResetToken(user.id, token, expiresAt);

    // Kirim email dengan link reset
    await sendResetEmail(email, token);

    res.render('forgot-password', { success: 'Reset link sent if email exists', error: null, formData: {} });
  } catch (err) {
    res.render('forgot-password', { error: 'Failed to send reset link', success: null, formData: req.body });
  }
};

// Render halaman reset password (token validasi)
exports.renderResetPassword = async (req, res) => {
  const { token } = req.params;
  try {
    const validToken = await userModel.validateResetToken(token);
    if (!validToken) {
      return res.render('reset-password', { error: 'Invalid or expired token', success: null, formData: {}, token: null });
    }
    res.render('reset-password', { error: null, success: null, formData: {}, token });
  } catch (err) {
    res.render('reset-password', { error: 'Internal error', success: null, formData: {}, token: null });
  }
};

// Proses reset password dengan token
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword || !confirmPassword) {
    return res.render('reset-password', { error: 'Both password fields are required', success: null, formData: req.body, token });
  }

  if (newPassword !== confirmPassword) {
    return res.render('reset-password', { error: 'Passwords do not match', success: null, formData: req.body, token });
  }

  if (newPassword.length < 6) {
    return res.render('reset-password', { error: 'Password must be at least 6 characters', success: null, formData: req.body, token });
  }

  try {
    const validToken = await userModel.validateResetToken(token);
    if (!validToken) {
      return res.render('reset-password', { error: 'Invalid or expired token', success: null, formData: {}, token: null });
    }

    const success = await userModel.updatePassword(validToken.user_id, newPassword);
    if (success) {
      // Hapus token setelah berhasil reset
      await userModel.deleteResetToken(token);

      return res.render('reset-password', { success: 'Password reset successful', error: null, formData: {}, token: null });
    } else {
      return res.render('reset-password', { error: 'Failed to update password', success: null, formData: req.body, token });
    }
  } catch (err) {
    return res.render('reset-password', { error: 'Internal error', success: null, formData: req.body, token });
  }
};

exports.changePassword = async (req, res) => {
  const userId = req.userId; // userId diisi oleh middleware auth setelah decode JWT
  const { email, oldPassword, newPassword } = req.body;

  // Validasi input wajib
  if (!email || !oldPassword || !newPassword) {
    return res.render('forgot-password', {
      error: 'Email, old password and new password are required',
      success: null,
      formData: req.body
    });
  }

  // Validasi panjang password baru minimal 6 karakter
  if (newPassword.length < 6) {
    return res.render('forgot-password', {
      error: 'New password must be at least 6 characters',
      success: null,
      formData: req.body
    });
  }

  try {
    // Cari user berdasarkan email
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.render('forgot-password', {
        error: 'User with this email not found',
        success: null,
        formData: req.body
      });
    }

    // Pastikan email sesuai user yang sedang login
    if (user.id !== userId) {
      return res.render('forgot-password', {
        error: 'Email does not match your logged-in account',
        success: null,
        formData: req.body
      });
    }

    // Verifikasi password lama cocok dengan password tersimpan
    const validOldPassword = await userModel.verifyPassword(oldPassword, user.password);
    if (!validOldPassword) {
      return res.render('forgot-password', {
        error: 'Old password is incorrect',
        success: null,
        formData: req.body
      });
    }

    // Update password dengan hash baru
    const successUpdate = await userModel.updatePassword(userId, newPassword);
    if (successUpdate) {
      return res.render('forgot-password', {
        success: 'Password changed successfully',
        error: null,
        formData: {}
      });
    } else {
      return res.render('forgot-password', {
        error: 'Failed to update password',
        success: null,
        formData: req.body
      });
    }
  } catch (error) {
    return res.render('forgot-password', {
      error: error.message,
      success: null,
      formData: req.body
    });
  }
};

exports.getAccountPage = async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.redirect('/users/login-register');  // Redirect if userId is missing
  }
  
  try {
    // Log userId to check if it's being set correctly
    console.log('userId:', userId);

    const user = await userModel.findById(userId);
    if (!user) {
      console.log('User not found');
      return res.redirect('/users/login-register');
    }

    const orders = await orderModel.getOrdersByUserId(userId);
    console.log('Orders:', orders);  // Log orders to check if they’re being fetched

    const addresses = await addressModel.getAddressesByUserId(userId);
    console.log('Addresses:', addresses);  // Log addresses

    const payments = await paymentModel.getPaymentsByUserId(userId);
    console.log('Payments:', payments);  // Log payments

    res.render('account', {
      user,
      orders,
      addresses,
      payments,
    });
  } catch (error) {
    console.error('Error loading account page:', error);
    res.status(500).send('Internal Server Error');
  }
};

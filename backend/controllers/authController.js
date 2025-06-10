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

    const token = jwt.sign({ userId: user.user_id, isAdmin: user.is_admin }, JWT_SECRET, { expiresIn: JWT_EXPIRESIN });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, 
    });

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
  res.status(200).json({ message: 'Logout successful' });
};

exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  const userId = req.userId;

  try {
    await userModel.updateUserProfile(name, email, userId)
    res.redirect('/users/account');
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.render('account', {
      error: 'Failed to update profile',
      success: null,
      formData: req.body
    });
  }
}

exports.changePassword = async (req, res) => {
  const userId = req.userId;
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
  
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      console.log('User not found');
      return res.redirect('/users/login-register');
    }

    const orders = await orderModel.getOrderByUserId(userId);
    console.log('Orders:', orders);  // Log orders to check if they’re being fetched

    const addresses = await addressModel.getAddressesByUserId(userId);
    console.log('Addresses:', addresses);  // Log addresses

    const payments = await paymentModel.getPaymentByUserId(userId);
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
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const { getCommonRenderData } = require('../utils/renderHelpers');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRESIN = process.env.JWT_EXPIRESIN;

exports.register = async (req, res) => {
  const { email, password, confirmPassword, name, terms } = req.body;
  const commonData = await getCommonRenderData(req.userId, { formData: req.body, title: 'Stay Awake Coffee - Register' });

  if (!email || !password || !confirmPassword || !name) {
    return res.render('login-register', { ...commonData, error: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.render('login-register', { ...commonData, error: "Password and confirm password do not match" });
  }

  if (!terms) {
    return res.render('login-register', { ...commonData, error: "You must agree to terms and privacy policy" });
  }

  try {
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.render('login-register', { ...commonData, error: 'Email already in use' });
    }

    const userId = await userModel.createUser({ name, email, password, role: 'user' });

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRESIN });
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.render('login-register', {
      ...commonData,
      success: 'Registration successful! You can now login.',
      redirectToHomepage: false,
    });
  } catch (error) {
    console.error(error);
    return res.render('login-register', { ...commonData, error: "Internal Server Error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const commonData = await getCommonRenderData(req.userId, { formData: req.body, title: 'Stay Awake Coffee - Login' });

  if (!email || !password) {
    return res.render('login-register', { ...commonData, error: "Email and password are required" });
  }

  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.render('login-register', { ...commonData, error: 'Invalid email or password' });
    }

    const validPassword = await userModel.verifyPassword(password, user.password);
    if (!validPassword) {
      return res.render('login-register', { ...commonData, error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.user_id, isAdmin: user.is_admin }, JWT_SECRET, { expiresIn: JWT_EXPIRESIN });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000,
    });

    res.render('login-register', {
      ...commonData,
      success: 'Login successful! Redirecting to homepage...',
      redirectToHomepage: true,
    });

  } catch (error) {
    console.error("Error login user:", error.message);
    return res.render('login-register', { ...commonData, error: "Internal Server Error" });
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
    await userModel.updateUserProfile(userId, name, email);
    res.redirect('/users/account?success=Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    const accountDataOnError = await getCommonRenderData(userId, {
      formData: req.body,
      error: 'Failed to update profile: ' + error.message,
      title: 'Stay Awake Coffee - My Account'
    });
    return res.render('account', accountDataOnError);
  }
};

exports.changePassword = async (req, res) => {
  const userId = req.userId;
  const { email, oldPassword, newPassword } = req.body;
  const commonDataForForgotPass = await getCommonRenderData(userId, { formData: req.body, title: 'Stay Awake Coffee - Change Password' });


  if (!email || !oldPassword || !newPassword) {
    return res.render('forgot-password', { ...commonDataForForgotPass, error: 'Email, old password and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.render('forgot-password', { ...commonDataForForgotPass, error: 'New password must be at least 6 characters' });
  }

  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      return res.render('forgot-password', { ...commonDataForForgotPass, error: 'User with this email not found' });
    }
    if (user.user_id !== userId) {
      return res.render('forgot-password', { ...commonDataForForgotPass, error: 'Email does not match your logged-in account' });
    }
    const validOldPassword = await userModel.verifyPassword(oldPassword, user.password);
    if (!validOldPassword) {
      return res.render('forgot-password', { ...commonDataForForgotPass, error: 'Old password is incorrect' });
    }

    const successUpdate = await userModel.updatePassword(userId, newPassword);
    if (successUpdate) {
      return res.render('forgot-password', { ...commonDataForForgotPass, success: 'Password changed successfully', formData: {} });
    } else {
      return res.render('forgot-password', { ...commonDataForForgotPass, error: 'Failed to update password' });
    }
  } catch (error) {
    console.error("Error changing password:", error);
    return res.render('forgot-password', { ...commonDataForForgotPass, error: error.message });
  }
};

exports.getAccountPage = async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.redirect('/users/login-register');
  }

  try {
    const accountData = await getCommonRenderData(userId, { title: 'Stay Awake Coffee - My Account' });
    if (req.query.success) {
      accountData.success = req.query.success;
    }
    res.render('account', accountData);
  } catch (error) {
    console.error('Error loading account page:', error);
    const accountDataOnError = await getCommonRenderData(userId, {
      error: 'Error loading account page: ' + error.message,
      title: 'Stay Awake Coffee - My Account'
    });
    res.status(500).render('account', accountDataOnError);
  }
};
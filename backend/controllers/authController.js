const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

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

    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return res.render('login-register', { error: "Internal Server Error", formData: req.body });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    // return res.status(400).json({ error: "Email and password are wrong" });
    return res.render('login-register', { error: "Email and password are required", formData: req.body });
  }

  try {
    const user = await userModel.findByEmail(email);
    if (!user) {
      // return res.status(401).json({ error: 'Invalid email or password' });
      return res.render('login-register', { error: 'Invalid email or password', formData: req.body });
    }
    const validPassword = await userModel.verifyPassword(password, user.password);
    if (!validPassword) {
      // return res.status(401).json({ error: 'Invalid email or password'});
      return res.render('login-register', { error: 'Invalid email or password', formData: req.body });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRESIN });
    res.cookie('token', token, { httpOnly: true }).json({ message: 'Login successful' });
    
    return res.redirect('/');
  } catch (error) {
    console.error("Error login user:", error.message);
    // res.status(500).json({ error: "Internal Server Error" });
    return res.render('login-register', { error: "Internal Server Error", formData: req.body });
  }
}

exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
};

exports.changePassword = async (req, res) => {
  const userId = req.userId;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return res.status(400).json({ error: 'Old password and new password are required' });

  if (newPassword.length < 6)
    return res.status(400).json({ error: 'New password must be at least 6 characters' });

  try {
    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const validOldPassword = await userModel.verifyPassword(oldPassword, user.password);
    if (!validOldPassword) return res.status(401).json({ error: 'Old password is incorrect' });

    const success = await userModel.updatePassword(userId, newPassword);
    if (success) {
      return res.json({ message: 'Password changed successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to update password' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getMe = async (req, res) => {
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
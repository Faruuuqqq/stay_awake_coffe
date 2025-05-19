const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRESIN;

exports.register = async (req, res) => {
  const { email, password, role, name } = req.body;
  
  if (!email ||  !password|| !name) {
    return res.status(400).json({ error: "Email, password, and name required "});
  }

  try {
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) return res.status(400).json({ error: 'Email already in use' }); 
    
    const userId = await userModel.createUser({ name, email, password, role });

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn });
    res.cookie('token', token, {
      httpOnly: true }).json({ message: 'Registration successful' });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are wrong" });
  }

  try {
    const user = await userModel.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const validPassword = await userModel.verifyPassword(password, user.password);
    if (!validPassword) return res.status(401).json({ error: 'Invalid email or password'});

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn });
    res.cookie('token', token, { httpOnly: true }).json({ message: 'Login successful' });
  } catch (error) {
    console.error("Error login user:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
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
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  const token = req.cookies.token;  // Ambil token dari cookie

  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Verifikasi token dan decode untuk mendapatkan userId
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded payload:', decoded);  // Pastikan payload ada di sini

    req.userId = decoded.userId;  // Ambil userId dari decoded payload
    console.log('userId:', req.userId);  // Cek apakah userId ada

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

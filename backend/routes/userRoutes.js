const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

// protected routes
router.post("/change-password", authMiddleware, authController.changePassword);
router.get("/profile", authMiddleware, authController.getMe);

module.exports = router;
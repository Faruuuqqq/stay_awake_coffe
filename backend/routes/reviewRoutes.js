const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, reviewController.createReview);
router.get('/product/:id', reviewController.getReviewsByProductId);
router.delete('/:id', authMiddleware, reviewController.deleteReview);

module.exports = router;

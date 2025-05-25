const reviewModel = require('../models/reviewModel');

exports.createReview = async (req, res) => {
  const userId = req.userId;
  const { productId, rating, comment } = req.body;

  if (!product_Id || !rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Invalid input data' });
  }

  try {
    const reviewId = await reviewModel.createReview({
      user_id: userId,
      product_id: productId,
      rating,
      comment: comment || null
    });
    res.status(201).json({ message: 'Review created successfully', reviewId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating review', error: error.message });   
  }
}

exports.getReviewsByProductId = async (req, res) => {
  const product_id = req.params.id;
  try {
    const reviews = await reviewModel.getReviewsByProductId(product_id);
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reviews', error: error.message });
  }
}

exports.deleteReview = async (req, res) => {
  const reviewId = req.params.id;
  const userId = req.userId;
  const userRole = req.role;

  try {
    const review = await reviewModel.findReviewById(reviewId);
    if (!review) return res.status(404).json({ message: 'Review not found' });

    if (review.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to delete this review' });
    }

    await reviewModel.deleteReview(reviewId);
    res.status(200).json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting review', error: error.message });
  }

}

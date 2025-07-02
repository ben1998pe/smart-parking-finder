const express = require('express');
const { body } = require('express-validator');
const {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
} = require('../controllers/reviews');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Validation middleware
const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot be more than 100 characters'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Comment must be between 10 and 500 characters')
];

// Public routes
router.get('/', getReviews);
router.get('/:id', getReview);

// Protected routes
router.use(protect);

router.post('/', authorize('user', 'admin'), reviewValidation, addReview);
router.put('/:id', authorize('user', 'admin'), reviewValidation, updateReview);
router.delete('/:id', authorize('user', 'admin'), deleteReview);

module.exports = router; 
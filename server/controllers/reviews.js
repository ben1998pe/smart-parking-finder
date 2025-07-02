const Review = require('../models/Review');
const ParkingLot = require('../models/ParkingLot');

// @desc    Get reviews for a parking lot
// @route   GET /api/parking/:parkingLotId/reviews
// @access  Public
const getReviews = async (req, res, next) => {
  try {
    let query;

    if (req.params.parkingLotId) {
      query = Review.find({ parkingLot: req.params.parkingLotId });
    } else {
      query = Review.find();
    }

    const reviews = await query
      .populate({
        path: 'user',
        select: 'name avatar'
      })
      .populate({
        path: 'parkingLot',
        select: 'name address'
      });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single review
// @route   GET /api/parking/:parkingLotId/reviews/:id
// @access  Public
const getReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name avatar'
      })
      .populate({
        path: 'parkingLot',
        select: 'name address'
      });

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review
// @route   POST /api/parking/:parkingLotId/reviews
// @access  Private
const addReview = async (req, res, next) => {
  try {
    req.body.parkingLot = req.params.parkingLotId;
    req.body.user = req.user.id;

    const parkingLot = await ParkingLot.findById(req.params.parkingLotId);

    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        error: 'Parking lot not found'
      });
    }

    // Check if user already reviewed this parking lot
    const existingReview = await Review.findOne({
      user: req.user.id,
      parkingLot: req.params.parkingLotId
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        error: 'You have already reviewed this parking lot'
      });
    }

    const review = await Review.create(req.body);

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/parking/:parkingLotId/reviews/:id
// @access  Private
const updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this review'
      });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/parking/:parkingLotId/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        error: 'Review not found'
      });
    }

    // Make sure review belongs to user or user is admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this review'
      });
    }

    await review.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview
}; 
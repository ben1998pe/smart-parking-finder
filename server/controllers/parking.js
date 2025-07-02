const ParkingLot = require('../models/ParkingLot');
const Review = require('../models/Review');

// @desc    Get all parking lots
// @route   GET /api/parking
// @access  Public
const getParkingLots = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = ParkingLot.find(JSON.parse(queryStr)).populate('owner', 'name email');

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await ParkingLot.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const parkingLots = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: parkingLots.length,
      pagination,
      data: parkingLots
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single parking lot
// @route   GET /api/parking/:id
// @access  Public
const getParkingLot = async (req, res, next) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id)
      .populate('owner', 'name email')
      .populate({
        path: 'reviews',
        select: 'title comment rating user createdAt',
        populate: {
          path: 'user',
          select: 'name avatar'
        }
      });

    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        error: 'Parking lot not found'
      });
    }

    res.status(200).json({
      success: true,
      data: parkingLot
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new parking lot
// @route   POST /api/parking
// @access  Private
const createParkingLot = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.owner = req.user.id;

    const parkingLot = await ParkingLot.create(req.body);

    res.status(201).json({
      success: true,
      data: parkingLot
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update parking lot
// @route   PUT /api/parking/:id
// @access  Private
const updateParkingLot = async (req, res, next) => {
  try {
    let parkingLot = await ParkingLot.findById(req.params.id);

    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        error: 'Parking lot not found'
      });
    }

    // Make sure user is parking lot owner or admin
    if (parkingLot.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this parking lot'
      });
    }

    parkingLot = await ParkingLot.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: parkingLot
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete parking lot
// @route   DELETE /api/parking/:id
// @access  Private
const deleteParkingLot = async (req, res, next) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);

    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        error: 'Parking lot not found'
      });
    }

    // Make sure user is parking lot owner or admin
    if (parkingLot.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this parking lot'
      });
    }

    await parkingLot.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get parking lots within radius
// @route   GET /api/parking/radius/:zipcode/:distance
// @access  Public
const getParkingLotsInRadius = async (req, res, next) => {
  try {
    const { latitude, longitude, distance = 10 } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Please provide latitude and longitude'
      });
    }

    // Calculate radius using radians
    // Divide distance by radius of Earth (3963 mi / 6378 km)
    const radius = distance / 3963;

    const parkingLots = await ParkingLot.find({
      location: {
        $geoWithin: {
          $centerSphere: [[parseFloat(longitude), parseFloat(latitude)], radius]
        }
      },
      isActive: true
    }).populate('owner', 'name email');

    res.status(200).json({
      success: true,
      count: parkingLots.length,
      data: parkingLots
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search parking lots
// @route   GET /api/parking/search
// @access  Public
const searchParkingLots = async (req, res, next) => {
  try {
    const { q, city, state, amenities, minRate, maxRate, available } = req.query;

    let query = { isActive: true };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Location filters
    if (city) {
      query['address.city'] = { $regex: city, $options: 'i' };
    }

    if (state) {
      query['address.state'] = { $regex: state, $options: 'i' };
    }

    // Amenities filter
    if (amenities) {
      const amenityArray = amenities.split(',');
      query.amenities = { $in: amenityArray };
    }

    // Rate filters
    if (minRate || maxRate) {
      query.hourlyRate = {};
      if (minRate) query.hourlyRate.$gte = parseFloat(minRate);
      if (maxRate) query.hourlyRate.$lte = parseFloat(maxRate);
    }

    // Availability filter
    if (available === 'true') {
      query.availableSpots = { $gt: 0 };
      query.isOpen = true;
    }

    const parkingLots = await ParkingLot.find(query)
      .populate('owner', 'name email')
      .sort({ rating: -1, availableSpots: -1 });

    res.status(200).json({
      success: true,
      count: parkingLots.length,
      data: parkingLots
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update parking lot availability
// @route   PUT /api/parking/:id/availability
// @access  Private
const updateAvailability = async (req, res, next) => {
  try {
    const { availableSpots, isOpen } = req.body;

    const parkingLot = await ParkingLot.findById(req.params.id);

    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        error: 'Parking lot not found'
      });
    }

    // Make sure user is parking lot owner or admin
    if (parkingLot.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this parking lot'
      });
    }

    // Validate available spots
    if (availableSpots !== undefined) {
      if (availableSpots < 0 || availableSpots > parkingLot.totalSpots) {
        return res.status(400).json({
          success: false,
          error: 'Available spots must be between 0 and total spots'
        });
      }
    }

    const updatedParkingLot = await ParkingLot.findByIdAndUpdate(
      req.params.id,
      {
        availableSpots: availableSpots !== undefined ? availableSpots : parkingLot.availableSpots,
        isOpen: isOpen !== undefined ? isOpen : parkingLot.isOpen,
        lastUpdated: Date.now()
      },
      { new: true }
    );

    // Emit real-time update via Socket.io
    const { io } = require('../index');
    io.to(`parking-lot-${req.params.id}`).emit('parking-updated', {
      parkingLotId: req.params.id,
      availableSpots: updatedParkingLot.availableSpots,
      isOpen: updatedParkingLot.isOpen,
      occupancyPercentage: updatedParkingLot.occupancyPercentage
    });

    res.status(200).json({
      success: true,
      data: updatedParkingLot
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get parking lot statistics
// @route   GET /api/parking/:id/stats
// @access  Public
const getParkingLotStats = async (req, res, next) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);

    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        error: 'Parking lot not found'
      });
    }

    // Get reviews count
    const reviewsCount = await Review.countDocuments({ parkingLot: req.params.id });

    // Get average rating
    const avgRating = await Review.aggregate([
      { $match: { parkingLot: parkingLot._id } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);

    const stats = {
      totalSpots: parkingLot.totalSpots,
      availableSpots: parkingLot.availableSpots,
      occupancyPercentage: parkingLot.occupancyPercentage,
      hourlyRate: parkingLot.hourlyRate,
      dailyRate: parkingLot.dailyRate,
      rating: parkingLot.rating,
      reviewsCount,
      averageRating: avgRating[0] ? Math.round(avgRating[0].avgRating * 10) / 10 : 0,
      isOpen: parkingLot.isOpen,
      isActive: parkingLot.isActive
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getParkingLots,
  getParkingLot,
  createParkingLot,
  updateParkingLot,
  deleteParkingLot,
  getParkingLotsInRadius,
  searchParkingLots,
  updateAvailability,
  getParkingLotStats
}; 
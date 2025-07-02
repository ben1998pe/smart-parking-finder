const express = require('express');
const {
  getParkingLots,
  getParkingLot,
  createParkingLot,
  updateParkingLot,
  deleteParkingLot,
  getParkingLotsInRadius,
  searchParkingLots,
  updateAvailability,
  getParkingLotStats
} = require('../controllers/parking');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Include other resource routers
const reviewRouter = require('./reviews');

// Re-route into other resource routers
router.use('/:parkingLotId/reviews', reviewRouter);

// Public routes
router.get('/', getParkingLots);
router.get('/search', searchParkingLots);
router.get('/radius', getParkingLotsInRadius);
router.get('/:id', getParkingLot);
router.get('/:id/stats', getParkingLotStats);

// Protected routes
router.use(protect);

// Owner and admin routes
router.post('/', authorize('user', 'admin', 'parking-owner'), createParkingLot);
router.put('/:id', authorize('user', 'admin', 'parking-owner'), updateParkingLot);
router.delete('/:id', authorize('user', 'admin', 'parking-owner'), deleteParkingLot);
router.put('/:id/availability', authorize('user', 'admin', 'parking-owner'), updateAvailability);

module.exports = router; 
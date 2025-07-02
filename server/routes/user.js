const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserPreferences
} = require('../controllers/user');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Admin only routes
router.route('/')
  .get(authorize('admin'), getUsers)
  .post(authorize('admin'), createUser);

router.route('/:id')
  .get(authorize('admin'), getUser)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

// User preferences
router.put('/preferences', updateUserPreferences);

module.exports = router; 
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const {
  dashboard,
  getUsers,
  getUser,
  updateUserRole,
  deleteUser,
  getAllBookings,
  getAllSessions,
  getRevenue,
  createSlot,
  updateSlot,
  deleteSlot,
  getIotStatus,
} = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');

const router = express.Router();

function checkValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
}

// Every route below requires a valid JWT AND role === 'admin'.
router.use(protect, adminOnly);

router.get('/dashboard', dashboard);

router.get('/users', getUsers);
router.get('/users/:id', param('id').isMongoId().withMessage('Invalid user id'), checkValidation, getUser);
router.patch(
  '/users/:id/role',
  [
    param('id').isMongoId().withMessage('Invalid user id'),
    body('role').isIn(['user', 'admin']).withMessage("role must be 'user' or 'admin'"),
  ],
  checkValidation,
  updateUserRole
);
router.delete('/users/:id', param('id').isMongoId().withMessage('Invalid user id'), checkValidation, deleteUser);

router.get('/bookings', getAllBookings);
router.get('/sessions', getAllSessions);
router.get('/revenue', getRevenue);

router.post(
  '/slots',
  [
    body('slotNumber').trim().notEmpty().withMessage('slotNumber is required'),
    body('pricePerHour').optional().isFloat({ min: 0 }).withMessage('pricePerHour must be a non-negative number'),
  ],
  checkValidation,
  createSlot
);
router.patch(
  '/slots/:id',
  [
    param('id').isMongoId().withMessage('Invalid slot id'),
    body('pricePerHour').optional().isFloat({ min: 0 }).withMessage('pricePerHour must be a non-negative number'),
    body('status').optional().isIn(['available', 'occupied', 'reserved']).withMessage('Invalid status'),
  ],
  checkValidation,
  updateSlot
);
router.delete('/slots/:id', param('id').isMongoId().withMessage('Invalid slot id'), checkValidation, deleteSlot);

router.get('/iot/status', getIotStatus);

module.exports = router;

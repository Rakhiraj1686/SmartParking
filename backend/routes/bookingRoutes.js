const express = require('express');
const { body } = require('express-validator');
const { create, getMine, getOne, cancel } = require('../controllers/bookingController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('vehicleNumber').trim().notEmpty().withMessage('vehicleNumber is required'),
    body('bookingDate').notEmpty().withMessage('bookingDate is required'),
    body('startTime').notEmpty().withMessage('startTime is required'),
    body('endTime').notEmpty().withMessage('endTime is required'),
  ],
  create
);

router.get('/my', getMine);
router.get('/:id', getOne);
router.patch('/:id/cancel', cancel);

module.exports = router;

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
    body('bookingDate')
      .notEmpty().withMessage('bookingDate is required')
      .matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('bookingDate must be in YYYY-MM-DD format'),
    body('startTime')
      .notEmpty().withMessage('startTime is required')
      .matches(/^\d{1,2}:\d{2}\s?(AM|PM)$/i).withMessage('startTime must look like "09:00 AM"'),
    body('endTime')
      .notEmpty().withMessage('endTime is required')
      .matches(/^\d{1,2}:\d{2}\s?(AM|PM)$/i).withMessage('endTime must look like "11:00 AM"')
      .custom((endTime, { req }) => {
        const { toMinutes } = require('../utils/timeOverlap');
        const start = toMinutes(req.body.startTime);
        const end = toMinutes(endTime);
        if (start !== null && end !== null && end <= start) {
          throw new Error('endTime must be after startTime');
        }
        return true;
      }),
  ],
  create
);

router.get('/my', getMine);
router.get('/:id', getOne);
router.patch('/:id/cancel', cancel);

module.exports = router;

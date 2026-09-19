const express = require('express');
const { getStatus, getSlots, getStats } = require('../controllers/parkingController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// Requires a logged-in user (any role) — per the route table, parking
// status/slots/stats are "Authenticated User" routes, not public ones.
router.use(protect);

router.get('/status', getStatus);
router.get('/slots', getSlots);
router.get('/stats', getStats);

module.exports = router;

const express = require('express');
const { getStatus, getSlots, getStats } = require('../controllers/parkingController');

const router = express.Router();

router.get('/status', getStatus);
router.get('/slots', getSlots);
router.get('/stats', getStats);

module.exports = router;

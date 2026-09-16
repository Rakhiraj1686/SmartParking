const express = require('express');
const { start, end, getMine } = require('../controllers/sessionController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/start', start);
router.post('/end', end);
router.get('/my', getMine);

module.exports = router;

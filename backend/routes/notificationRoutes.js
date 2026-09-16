const express = require('express');
const { getMine, markRead, markAllRead } = require('../controllers/notificationController');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getMine);
router.patch('/:id/read', markRead);
router.patch('/read-all', markAllRead);

module.exports = router;

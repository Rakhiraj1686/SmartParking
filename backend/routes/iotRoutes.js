const express = require('express');
const { postStatus } = require('../controllers/iotController');
const verifyIotKey = require('../middleware/iotMiddleware');

const router = express.Router();

router.post('/status', verifyIotKey, postStatus);

module.exports = router;

const iotService = require('../services/iotService');
const IotLog = require('../models/IotLog');

async function postStatus(req, res, next) {
  try {
    const { occupiedSlots, totalSlots, slots } = req.body;

    const usingAggregate = !Array.isArray(slots);
    if (usingAggregate) {
      if (typeof occupiedSlots !== 'number') {
        return res.status(400).json({ success: false, message: 'occupiedSlots must be a number' });
      }
      const cap = typeof totalSlots === 'number' ? totalSlots : 4;
      if (occupiedSlots < 0 || occupiedSlots > cap) {
        return res.status(400).json({ success: false, message: `occupiedSlots must be between 0 and ${cap}` });
      }
    }

    const { mode, payload } = await iotService.handleStatusUpdate(req.body);

    const io = req.app.get('io');
    io.emit('parkingStatusUpdated', { ...payload, timestamp: new Date().toISOString() });
    if (payload.availableSlots === 0) io.emit('parkingFull', { timestamp: new Date().toISOString() });
    if (payload.availableSlots > 0) io.emit('parkingAvailable', { availableSlots: payload.availableSlots });

    // Admin-only real-time feed (restricted to the 'admins' room; see
    // sockets/parkingSocket.js).
    const recentLogs = await IotLog.find().sort({ createdAt: -1 }).limit(20);
    io.to('admins').emit('adminIotUpdate', {
      online: true,
      lastArduinoUpdate: new Date().toISOString(),
      occupiedSlots: payload.occupiedSlots,
      totalCapacity: payload.totalCapacity,
      recentLogs,
    });

    res.status(200).json({
      success: true,
      message: `Parking status updated (${mode})`,
      data: payload,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { postStatus };

const ParkingSession = require('../models/ParkingSession');
const Notification = require('../models/Notification');
const { PARKING_RATE_PER_HOUR } = require('../config/constants');

async function start(req, res, next) {
  try {
    const { vehicleNumber, bookingId } = req.body;
    if (!vehicleNumber) {
      return res.status(400).json({ success: false, message: 'vehicleNumber is required' });
    }

    const session = await ParkingSession.create({
      userId: req.user._id,
      bookingId: bookingId || null,
      vehicleNumber,
      entryTime: new Date(),
      status: 'active',
    });

    res.status(201).json({ success: true, message: 'Parking session started', data: session });
  } catch (err) {
    next(err);
  }
}

async function end(req, res, next) {
  try {
    const { sessionId } = req.body;
    const session = await ParkingSession.findById(sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.status === 'completed') {
      return res.status(409).json({ success: false, message: 'Session already completed' });
    }

    session.exitTime = new Date();
    session.durationMinutes = Math.max(1, Math.round((session.exitTime - session.entryTime) / 60000));
    session.amount = Math.max(1, Math.ceil(session.durationMinutes / 60)) * PARKING_RATE_PER_HOUR;
    session.status = 'completed';
    await session.save();

    await Notification.create({
      userId: session.userId,
      type: 'info',
      message: `Your parking session for ${session.vehicleNumber} has ended. Duration: ${session.durationMinutes} min.`,
    });

    const io = req.app.get('io');
    io.emit('parkingSessionCompleted', { session });

    res.status(200).json({ success: true, message: 'Parking session ended', data: session });
  } catch (err) {
    next(err);
  }
}

async function getMine(req, res, next) {
  try {
    const sessions = await ParkingSession.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, message: 'Your parking sessions', data: sessions });
  } catch (err) {
    next(err);
  }
}

module.exports = { start, end, getMine };

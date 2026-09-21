const parkingService = require('../services/parkingService');
const IotLog = require('../models/IotLog');

// Events emitted app-wide (by controllers/services, via req.app.get('io')):
//   parkingStatusUpdated  { totalCapacity, occupiedSlots, availableSlots, reservedSlots, bookableSlots, timestamp }
//   bookingCreated        { booking }              (public shape; no other user's PII)
//   bookingCancelled      { booking }
//   parkingFull           { ... }
//   parkingAvailable      { availableSlots }
//   parkingSessionCompleted { session }
//
// Admin-only (emitted to the 'admins' room only — see server.js's socket
// auth middleware, which joins verified admin sockets to this room):
//   adminIotUpdate         { online, lastArduinoUpdate, occupiedSlots, totalCapacity, recentLogs }
function initParkingSocket(io) {
  io.on('connection', async (socket) => {
    console.log(`[socket] client connected: ${socket.id}${socket.user ? ` (user ${socket.user.id}, role ${socket.user.role})` : ' (guest)'}`);

    if (socket.user?.role === 'admin') {
      socket.join('admins');
    }

    try {
      const parking = await parkingService.getOrCreateParking();
      const statusPayload = await parkingService.toStatusPayload(parking);
      socket.emit('parkingStatusUpdated', {
        ...statusPayload,
        timestamp: new Date().toISOString(),
      });

      if (socket.user?.role === 'admin') {
        const recentLogs = await IotLog.find().sort({ createdAt: -1 }).limit(20);
        socket.emit('adminIotUpdate', {
          online: !!parking.lastArduinoUpdate && Date.now() - new Date(parking.lastArduinoUpdate).getTime() < 60000,
          lastArduinoUpdate: parking.lastArduinoUpdate,
          occupiedSlots: parking.occupiedSlots,
          totalCapacity: parking.totalCapacity,
          recentLogs,
        });
      }
    } catch (err) {
      console.error('[socket] failed to send initial status:', err.message);
    }

    socket.on('disconnect', () => {
      console.log(`[socket] client disconnected: ${socket.id}`);
    });
  });
}

module.exports = initParkingSocket;

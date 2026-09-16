const parkingService = require('../services/parkingService');

// Events emitted app-wide (by controllers/services, via req.app.get('io')):
//   parkingStatusUpdated  { totalCapacity, occupiedSlots, availableSlots, reservedSlots, bookableSlots, timestamp }
//   bookingCreated        { booking }
//   bookingCancelled      { booking }
//   parkingFull           { ... }
//   parkingAvailable      { availableSlots }
//   parkingSessionCompleted { session }
function initParkingSocket(io) {
  io.on('connection', async (socket) => {
    console.log(`[socket] client connected: ${socket.id}`);

    try {
      const parking = await parkingService.getOrCreateParking();
      socket.emit('parkingStatusUpdated', {
        ...parkingService.toStatusPayload(parking),
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[socket] failed to send initial status:', err.message);
    }

    socket.on('disconnect', () => {
      console.log(`[socket] client disconnected: ${socket.id}`);
    });
  });
}

module.exports = initParkingSocket;

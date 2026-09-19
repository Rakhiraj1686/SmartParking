require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const User = require('./models/User');

const connectDB = require('./config/db');
const initParkingSocket = require('./sockets/parkingSocket');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const iotRoutes = require('./routes/iotRoutes');

const app = express();
const server = http.createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: { origin: FRONTEND_URL, methods: ['GET', 'POST'] },
});
app.set('io', io);

// Socket auth is OPTIONAL: an unauthenticated/guest socket can still
// receive the public `parkingStatusUpdated` broadcast. If a valid JWT is
// supplied in the handshake, we attach the user and (if admin) join the
// 'admins' room, which is the only audience for admin-only events (see
// sockets/parkingSocket.js and controllers/iotController.js).
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (user) socket.user = { id: String(user._id), role: user.role };
    return next();
  } catch {
    // Invalid/expired token: treat as a guest connection rather than
    // rejecting outright, since parkingStatusUpdated is public.
    return next();
  }
});

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Smart Parking API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/iot', iotRoutes);

app.use(notFound);
app.use(errorHandler);

initParkingSocket(io);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`[server] Smart Parking API listening on port ${PORT}`);
    console.log(`[server] CORS allowed origin: ${FRONTEND_URL}`);
  });
}

start();

module.exports = { app, server, io };

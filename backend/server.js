require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const adminRoutes = require('./routes/adminRoutes');
const iotRoutes = require('./routes/iotRoutes');
const initParkingSocket = require('./sockets/parkingSocket');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: frontendUrl }));
app.use(express.json());

app.get('/api/health', (req, res) => {
	res.json({ success: true, message: 'Smart Parking backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/iot', iotRoutes);

app.use(notFound);
app.use(errorHandler);

const io = new Server(server, {
	cors: { origin: frontendUrl },
});

io.use(async (socket, next) => {
	const token = socket.handshake.auth?.token;
	if (!token) return next();

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId);
		if (user) socket.user = user;
		next();
	} catch (err) {
		next();
	}
});

app.set('io', io);
initParkingSocket(io);

const port = Number(process.env.PORT) || 5000;

async function startServer() {
	await connectDB();
	server.listen(port, () => {
		console.log(`[server] listening on http://localhost:${port}`);
	});
}

startServer();

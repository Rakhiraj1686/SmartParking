require('dotenv').config();

const cors = require('cors');
const express = require('express');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

const connectDB = require('./config/db');
const User = require('./models/User');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const initParkingSocket = require('./sockets/parkingSocket');

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const iotRoutes = require('./routes/iotRoutes');

const app = express();
const server = http.createServer(app);
const configuredOrigins = (process.env.FRONTEND_URL || '')
	.split(',')
	.map((origin) => origin.trim().replace(/\/$/, ''))
	.filter(Boolean);
const allowedOrigins = [
	'http://localhost:5173',
	'http://127.0.0.1:5173',
	'https://smart-parking-beryl-eight.vercel.app',
	...configuredOrigins,
];
const corsOptions = {
	origin(origin, callback) {
		const isAllowed = !origin || allowedOrigins.includes(origin);
		console.log(`[cors] origin=${origin || 'none'} allowed=${isAllowed}`);

		if (isAllowed) {
			return callback(null, true);
		}

		console.error(`[cors] blocked origin=${origin}`);
		return callback(new Error(`CORS origin not allowed: ${origin}`));
	},
	optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());

app.get('/api/health', (req, res) => {
	res.json({ success: true, message: 'Smart Parking API is running' });
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

const io = new Server(server, {
	cors: { origin: allowedOrigins },
});

io.use(async (socket, next) => {
	try {
		const token = socket.handshake.auth?.token;
		if (!token) return next();

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId).select('_id role');
		if (user) socket.user = { id: user._id.toString(), role: user.role };
		next();
	} catch {
		next();
	}
});

app.set('io', io);
initParkingSocket(io);

const port = Number(process.env.PORT) || 5000;

async function startServer() {
	await connectDB();
	server.listen(port, () => {
		console.log(`[server] Smart Parking API listening on port ${port}`);
		console.log(`[server] CORS allowed origins: ${allowedOrigins.join(', ')}`);
	});
}

if (require.main === module) {
	startServer();
}

module.exports = { app, server, startServer };

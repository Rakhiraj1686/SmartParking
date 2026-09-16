require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Parking = require('../models/Parking');
const ParkingSlot = require('../models/ParkingSlot');
const Booking = require('../models/Booking');
const ParkingSession = require('../models/ParkingSession');
const Notification = require('../models/Notification');

const TOTAL_SLOTS = parseInt(process.env.TOTAL_SLOTS, 10) || 4;

async function seed() {
  await connectDB();

  console.log('[seed] Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Parking.deleteMany({}),
    ParkingSlot.deleteMany({}),
    Booking.deleteMany({}),
    ParkingSession.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('[seed] Creating aggregate parking status (matches real Arduino hardware capacity)...');
  // occupiedSlots starts at 0 — this document is meant to be overwritten by
  // the real Arduino via POST /api/iot/status once it's wired up. It is
  // NOT meant to be treated as live sensor data until then.
  const parking = await Parking.create({
    singletonId: 'current',
    totalCapacity: TOTAL_SLOTS,
    occupiedSlots: 0,
    reservedSlots: 0,
    source: 'seed',
  });

  console.log(`[seed] Creating ${TOTAL_SLOTS} parking slot records (P01..P0${TOTAL_SLOTS})...`);
  const slotDocs = Array.from({ length: TOTAL_SLOTS }, (_, i) => ({
    slotNumber: `P${String(i + 1).padStart(2, '0')}`,
    status: 'available',
    sensorStatus: 'none', // honest: no per-slot hardware exists yet
    pricePerHour: 40,
  }));
  const slots = await ParkingSlot.insertMany(slotDocs);

  console.log('[seed] Creating admin + demo users...');
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@smartparking.local',
    password: 'Admin@123',
    phone: '+91 90000 00000',
    vehicleNumber: 'MP09 ZZ 0000',
    vehicleType: 'Car',
    role: 'admin',
  });

  const demoUsersData = [
    { name: 'Arjun Mehta', email: 'arjun@example.com', vehicleNumber: 'MP09 AB 4521', vehicleType: 'Car' },
    { name: 'Priya Sharma', email: 'priya@example.com', vehicleNumber: 'MP09 CD 7743', vehicleType: 'SUV' },
    { name: 'Rohan Verma', email: 'rohan@example.com', vehicleNumber: 'MP09 EF 1122', vehicleType: 'Bike' },
  ];
  const demoUsers = [];
  for (const u of demoUsersData) {
    // eslint-disable-next-line no-await-in-loop
    const created = await User.create({ ...u, password: 'Demo@123', phone: '+91 98765 00000', role: 'user' });
    demoUsers.push(created);
  }

  console.log('[seed] Creating demo bookings (does not touch real Arduino occupancy)...');
  const [slotA, slotB] = slots;
  const demoBookings = [];
  if (slotA) {
    slotA.status = 'reserved';
    await slotA.save();
    parking.reservedSlots += 1;
    demoBookings.push(
      await Booking.create({
        bookingId: 'BK-10231',
        userId: demoUsers[0]._id,
        slotId: slotA._id,
        slotNumber: slotA.slotNumber,
        vehicleNumber: demoUsers[0].vehicleNumber,
        vehicleType: demoUsers[0].vehicleType,
        bookingDate: new Date().toISOString().slice(0, 10),
        startTime: '09:00 AM',
        endTime: '11:00 AM',
        amount: 80,
        status: 'upcoming',
      })
    );
  }
  if (slotB) {
    demoBookings.push(
      await Booking.create({
        bookingId: 'BK-10187',
        userId: demoUsers[1]._id,
        slotId: slotB._id,
        slotNumber: slotB.slotNumber,
        vehicleNumber: demoUsers[1].vehicleNumber,
        vehicleType: demoUsers[1].vehicleType,
        bookingDate: '2026-09-03',
        startTime: '02:00 PM',
        endTime: '04:30 PM',
        amount: 100,
        status: 'completed',
      })
    );
  }
  await parking.save();

  console.log('[seed] Creating demo parking sessions...');
  await ParkingSession.create({
    userId: demoUsers[1]._id,
    bookingId: demoBookings[1]?._id || null,
    vehicleNumber: demoUsers[1].vehicleNumber,
    entryTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
    exitTime: new Date(Date.now() - 40 * 60 * 1000),
    durationMinutes: 140,
    amount: 100,
    status: 'completed',
  });

  console.log('[seed] Creating demo notifications...');
  await Notification.create([
    {
      userId: demoUsers[0]._id,
      type: 'success',
      message: `Parking space reserved (booking ${demoBookings[0]?.bookingId}).`,
    },
    { userId: null, type: 'info', message: 'Welcome to Smart Parking — status is seed data until the Arduino connects.' },
  ]);

  console.log('[seed] Done.');
  console.log('[seed] Admin login: admin@smartparking.local / Admin@123');
  console.log('[seed] Demo user login: arjun@example.com / Demo@123');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});

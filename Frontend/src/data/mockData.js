// -----------------------------------------------------------------------
// Mock data for the SmartPark dashboard.
// This file simulates what a backend/API (fed by the Arduino/ESP32 sensor
// network) would eventually return. Nothing here is persisted — it just
// gives the frontend something realistic to render and mutate in memory.
// -----------------------------------------------------------------------

export const PARKING_AREA = {
  name: 'MG Road Smart Parking Complex',
  address: 'MG Road, Indore, Madhya Pradesh',
  totalFloors: 1,
  ratePerHour: 40,
};

// Deterministic-looking pseudo-random pattern so the layout looks
// realistic (roughly 45% available / 42% occupied / 13% reserved)
// instead of a perfectly even split.
function statusForIndex(i) {
  const pattern = [
    'occupied', 'available', 'available', 'occupied', 'reserved',
    'available', 'occupied', 'available', 'occupied', 'available',
    'reserved', 'occupied', 'available', 'available', 'occupied',
    'available', 'occupied', 'reserved', 'available', 'occupied',
  ];
  return pattern[i % pattern.length];
}

const VEHICLE_TYPES = ['Car', 'Bike', 'SUV', 'EV'];

export const initialParkingSlots = Array.from({ length: 36 }, (_, i) => {
  const num = i + 1;
  const id = `P${String(num).padStart(2, '0')}`;
  const status = statusForIndex(i);
  const zone = num <= 12 ? 'A' : num <= 24 ? 'B' : 'C';
  return {
    id,
    zone,
    status, // available | occupied | reserved
    price: zone === 'C' ? 50 : 40,
    vehicleType: status !== 'available' ? VEHICLE_TYPES[i % VEHICLE_TYPES.length] : null,
    reservedUntil: status === 'reserved' ? '5:30 PM' : null,
    floor: 'Ground Floor',
  };
});

export const initialBookings = [
  {
    id: 'BK-10231',
    slotId: 'P09',
    date: '2026-09-09',
    startTime: '09:00 AM',
    endTime: '11:00 AM',
    vehicleType: 'Car',
    vehicleNumber: 'MP09 AB 4521',
    amount: 80,
    status: 'upcoming',
  },
  {
    id: 'BK-10187',
    slotId: 'P22',
    date: '2026-09-03',
    startTime: '02:00 PM',
    endTime: '04:30 PM',
    vehicleType: 'SUV',
    vehicleNumber: 'MP09 CD 7743',
    amount: 100,
    status: 'completed',
  },
  {
    id: 'BK-10142',
    slotId: 'P05',
    date: '2026-08-28',
    startTime: '10:00 AM',
    endTime: '01:00 PM',
    vehicleType: 'Car',
    vehicleNumber: 'MP09 AB 4521',
    amount: 120,
    status: 'completed',
  },
];

export const parkingHistory = [
  {
    id: 'HX-9081',
    date: '2026-09-03',
    slotId: 'P22',
    entryTime: '02:04 PM',
    exitTime: '04:26 PM',
    duration: '2h 22m',
    amount: 100,
    status: 'Completed',
  },
  {
    id: 'HX-9052',
    date: '2026-08-28',
    slotId: 'P05',
    entryTime: '10:00 AM',
    exitTime: '01:05 PM',
    duration: '3h 05m',
    amount: 120,
    status: 'Completed',
  },
  {
    id: 'HX-8990',
    date: '2026-08-20',
    slotId: 'P14',
    entryTime: '06:40 PM',
    exitTime: '08:10 PM',
    duration: '1h 30m',
    amount: 60,
    status: 'Completed',
  },
  {
    id: 'HX-8944',
    date: '2026-08-14',
    slotId: 'P02',
    entryTime: '08:15 AM',
    exitTime: '09:00 AM',
    duration: '45m',
    amount: 40,
    status: 'Completed',
  },
  {
    id: 'HX-8901',
    date: '2026-08-09',
    slotId: 'P31',
    entryTime: '11:30 AM',
    exitTime: '03:45 PM',
    duration: '4h 15m',
    amount: 210,
    status: 'Cancelled',
  },
];

export const initialNotifications = [
  {
    id: 'N-501',
    type: 'success',
    message: 'Slot P09 has been successfully booked.',
    timestamp: '2 min ago',
    read: false,
  },
  {
    id: 'N-500',
    type: 'reminder',
    message: 'Your booking at P09 starts in 30 minutes.',
    timestamp: '28 min ago',
    read: false,
  },
  {
    id: 'N-499',
    type: 'info',
    message: 'Slot P05 is now available.',
    timestamp: '1 hr ago',
    read: true,
  },
  {
    id: 'N-498',
    type: 'info',
    message: 'Your parking session at P22 has ended.',
    timestamp: '5 hr ago',
    read: true,
  },
  {
    id: 'N-497',
    type: 'warning',
    message: 'Slot P14 sensor lost connection briefly and has recovered.',
    timestamp: 'Yesterday',
    read: true,
  },
];

export const userProfile = {
  name: 'Arjun Mehta',
  email: 'arjun.mehta@example.com',
  phone: '+91 98765 43210',
  vehicleNumber: 'MP09 AB 4521',
  vehicleType: 'Car',
  preferences: {
    preferredZone: 'A',
    autoExtend: false,
    notifyBeforeExpiry: true,
  },
};

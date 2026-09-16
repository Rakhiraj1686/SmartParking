# Smart Parking — Backend

Node.js / Express / MongoDB backend + IoT ingestion for the Arduino Smart
Parking System, built to sit behind the existing `Frontend/` React app.

## ⚠️ Hardware reality check (read this first)

The current Arduino (1 entry IR sensor + 1 exit IR sensor) can only ever
know **how many** cars are inside (`occupiedSlots`, 0–4). It **cannot**
know **which** of P01–P04 is occupied. Two collections reflect this
honestly:

- `Parking` — the single aggregate document the real Arduino drives via
  `POST /api/iot/status`. This is the source of truth for availability.
- `ParkingSlot` — per-slot records (P01–P04) that exist so the frontend's
  existing per-slot UI keeps working. Their `status` is **booking-driven
  only** (`sensorStatus: 'none'`) until real per-slot sensors are wired
  up — see "Future hardware" below.

`POST /api/iot/status` already accepts a future `slots: [...]` payload
shape and will switch to a per-slot source of truth automatically the day
you add real per-slot sensors — no backend rewrite needed.

## 1. Install

```bash
cd backend
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart_parking
JWT_SECRET=some_long_random_string
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
IOT_API_KEY=some_other_random_string
TOTAL_SLOTS=4
```

Never commit the real `.env`.

## 3. Start MongoDB

Any of:
- Local install: `mongod --dbpath ./data`
- Docker: `docker run -d -p 27017:27017 --name smart-parking-mongo mongo:7`
- MongoDB Atlas: paste the connection string into `MONGO_URI`

## 4. Seed the database

```bash
npm run seed
```

Creates:
- 1 admin (`admin@smartparking.local` / `Admin@123`)
- 3 demo users (`arjun@example.com` / `priya@example.com` / `rohan@example.com`, all `Demo@123`)
- 4 `ParkingSlot` documents (P01–P04)
- 1 aggregate `Parking` document at `occupiedSlots: 0` (waits for the real Arduino)
- a couple of demo bookings, a demo session, demo notifications

## 5. Run the backend

```bash
npm run dev     # nodemon, auto-restart
# or
npm start
```

Health check: `GET http://localhost:5000/api/health`

## API endpoints

### Auth
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | — | |
| POST | `/api/auth/login` | — | |
| GET | `/api/auth/me` | JWT | |

### Parking (aggregate + future per-slot)
| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/api/parking/status` | — | `{ totalCapacity, occupiedSlots, availableSlots, reservedSlots, bookableSlots, lastArduinoUpdate }` |
| GET | `/api/parking/slots` | — | Future per-slot structure (booking-driven today) |
| GET | `/api/parking/stats` | — | Adds `occupancyPercentage` |

### Bookings
| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/bookings` | JWT | body: `slotNumber?, vehicleNumber, vehicleType, bookingDate, startTime, endTime` |
| GET | `/api/bookings/my` | JWT | |
| GET | `/api/bookings/:id` | JWT | `:id` is the `bookingId` string, e.g. `BK-10232` |
| PATCH | `/api/bookings/:id/cancel` | JWT | |

### Sessions (physical entry/exit)
| Method | Path | Auth |
|---|---|---|
| POST | `/api/sessions/start` | JWT |
| POST | `/api/sessions/end` | JWT |
| GET | `/api/sessions/my` | JWT |

### Notifications
| Method | Path | Auth |
|---|---|---|
| GET | `/api/notifications` | JWT |
| PATCH | `/api/notifications/:id/read` | JWT |
| PATCH | `/api/notifications/read-all` | JWT |

### Admin
| Method | Path | Auth |
|---|---|---|
| GET | `/api/admin/dashboard` | JWT + admin role |

### IoT (Arduino / ESP gateway)
| Method | Path | Auth |
|---|---|---|
| POST | `/api/iot/status` | `X-IOT-API-KEY` header |

Current-hardware body:
```json
{ "occupiedSlots": 2, "totalSlots": 4 }
```

Future per-slot body (once real per-slot sensors exist):
```json
{
  "slots": [
    { "slotNumber": "P01", "occupied": true },
    { "slotNumber": "P02", "occupied": false }
  ]
}
```

### Health
`GET /api/health` → `{ "success": true, "message": "Smart Parking API is running" }`

## Socket.IO events (broadcast to all connected clients)

| Event | Payload |
|---|---|
| `parkingStatusUpdated` | `{ totalCapacity, occupiedSlots, availableSlots, reservedSlots, bookableSlots, timestamp }` |
| `bookingCreated` | `{ booking }` |
| `bookingCancelled` | `{ booking }` |
| `parkingFull` | `{ ... }` |
| `parkingAvailable` | `{ availableSlots }` |
| `parkingSessionCompleted` | `{ session }` |

## Arduino / ESP8266 / ESP32 integration

**The Arduino UNO has no built-in Wi-Fi and cannot call this API directly.**
Two supported paths — see `/arduino` folder at the repo root:

1. **Recommended:** Arduino UNO keeps running your existing sketch
   unchanged, and additionally prints `STATUS,<occupied>,<total>` over
   serial on every change (see `arduino/smart_parking_with_serial_status.ino`).
   An ESP8266/ESP32 wired to the UNO's serial (or a USB-serial bridge
   running on a laptop/Raspberry Pi) reads that line and POSTs it to
   `/api/iot/status`. See `arduino/esp_wifi_bridge.ino` for a ready-made
   ESP8266/ESP32 sketch, or `arduino/serial_bridge.py` for a PC-based
   bridge if you don't have an ESP module yet.
2. **Full upgrade:** replace the UNO with an ESP32 directly (it has
   built-in Wi-Fi and enough pins for the same sensors), and have it POST
   `/api/iot/status` itself.

Either way, request format:
```
POST /api/iot/status
Content-Type: application/json
X-IOT-API-KEY: <value of IOT_API_KEY in .env>

{ "occupiedSlots": 2, "totalSlots": 4 }
```

## Testing checklist

1. `mongod` running (or Atlas URI set)
2. `npm run dev`
3. `npm run seed`
4. `curl http://localhost:5000/api/health`
5. `POST /api/auth/register`
6. `POST /api/auth/login`
7. `GET /api/parking/status`
8. `POST /api/bookings` (with JWT)
9. `PATCH /api/bookings/:id/cancel`
10. `POST /api/iot/status` with correct `X-IOT-API-KEY`
11. Connect a Socket.IO client and watch `parkingStatusUpdated` fire
12. Connect the frontend (`Frontend/src/services/parkingService.js`) and click through the UI
13. Push `occupiedSlots: 4, totalSlots: 4` to `/api/iot/status` → confirm "parking full" behaviour
14. `GET /api/parking/status` after step 13 → `availableSlots: 0`
15. `POST /api/iot/status` with a wrong `X-IOT-API-KEY` → expect `401`
16. `POST /api/bookings` with no bookable capacity left → expect `409`
17. `GET /api/admin/dashboard` as a non-admin → expect `403`

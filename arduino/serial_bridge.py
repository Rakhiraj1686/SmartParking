#!/usr/bin/env python3
"""
Smart Parking — Serial-to-HTTP bridge (PC / Raspberry Pi alternative)

Use this if you don't have an ESP8266/ESP32 handy yet. Plug the Arduino
UNO into this machine over USB, run this script, and it will read
"STATUS,<occupied>,<total>" lines (see
arduino/smart_parking_with_serial_status.ino) and forward them to the
backend's /api/iot/status endpoint.

Setup:
    pip install pyserial requests
    python serial_bridge.py

Edit the constants below for your setup.
"""

import time
import serial
import requests

SERIAL_PORT = "COM3"
# SERIAL_PORT = "/dev/ttyUSB0"   # Windows: "COM3", macOS: "/dev/tty.usbmodemXXXX"
BAUD_RATE = 9600

BACKEND_URL = "http://localhost:5000/api/iot/status"
IOT_API_KEY = "d6eab33a70854c9c860d23987d167f65"  # must match backend/.env IOT_API_KEY


def post_status(occupied: int, total: int) -> None:
    try:
        res = requests.post(
            BACKEND_URL,
            json={"occupiedSlots": occupied, "totalSlots": total},
            headers={"X-IOT-API-KEY": IOT_API_KEY},
            timeout=5,
        )
        print(f"[bridge] POST {occupied}/{total} -> {res.status_code}")
    except requests.RequestException as exc:
        print(f"[bridge] request failed: {exc}")


def main() -> None:
    print(f"[bridge] opening {SERIAL_PORT} @ {BAUD_RATE} baud")
    with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1) as ser:
        time.sleep(2)  # let the Arduino reset after the port opens
        while True:
            line = ser.readline().decode("utf-8", errors="ignore").strip()
            if not line.startswith("STATUS,"):
                continue
            try:
                _, occupied_str, total_str = line.split(",")
                post_status(int(occupied_str), int(total_str))
            except ValueError:
                print(f"[bridge] could not parse line: {line!r}")


if __name__ == "__main__":
    main()

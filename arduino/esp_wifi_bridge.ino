/*
====================================================
 SMART PARKING — ESP8266/ESP32 Wi-Fi BRIDGE
====================================================

The Arduino UNO has no Wi-Fi. This sketch runs on a SEPARATE ESP8266 or
ESP32 board wired to the UNO's serial output (see
smart_parking_with_serial_status.ino), reads lines like:

    STATUS,2,4

and forwards them to the backend as:

    POST /api/iot/status
    X-IOT-API-KEY: <IOT_API_KEY from backend/.env>
    Content-Type: application/json
    { "occupiedSlots": 2, "totalSlots": 4 }

WIRING (UNO -> ESP8266/ESP32), 3.3V logic level shifting required on the
ESP's RX pin since the UNO's TX is 5V:
    UNO TX (D1) -> [voltage divider or level shifter] -> ESP RX
    UNO GND     -> ESP GND

(Do NOT connect UNO TX directly to an ESP RX pin — it will damage it.)

If you'd rather avoid extra wiring/level-shifting while prototyping, use
serial_bridge.py on a laptop/Raspberry Pi connected to the UNO via USB
instead — functionally identical, just runs on a PC.

Board support needed in Arduino IDE:
  - ESP8266: "esp8266" boards package (use <ESP8266WiFi.h> / <ESP8266HTTPClient.h>)
  - ESP32:   "esp32" boards package (use <WiFi.h> / <HTTPClient.h>)
This file is written for ESP32; swap the two includes noted below for ESP8266.
====================================================
*/

#include <WiFi.h>          // ESP8266: use <ESP8266WiFi.h>
#include <HTTPClient.h>    // ESP8266: use <ESP8266HTTPClient.h>

const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Point this at your backend, e.g. "http://192.168.1.50:5000" on the
// same LAN, or a deployed HTTPS URL.
const char* BACKEND_URL = "http://192.168.1.50:5000/api/iot/status";
const char* IOT_API_KEY = "YOUR_IOT_API_KEY";

String serialBuffer = "";

void setup()
{
  Serial.begin(9600);   // from the Arduino UNO
  connectWiFi();
}

void loop()
{
  while (Serial.available())
  {
    char c = Serial.read();
    if (c == '\n')
    {
      handleLine(serialBuffer);
      serialBuffer = "";
    }
    else if (c != '\r')
    {
      serialBuffer += c;
    }
  }

  if (WiFi.status() != WL_CONNECTED)
  {
    connectWiFi();
  }
}

void connectWiFi()
{
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000)
  {
    delay(300);
  }
}

// Parses "STATUS,<occupied>,<total>" and POSTs it to the backend.
void handleLine(const String& line)
{
  if (!line.startsWith("STATUS,")) return;

  int firstComma = line.indexOf(',');
  int secondComma = line.indexOf(',', firstComma + 1);
  if (firstComma < 0 || secondComma < 0) return;

  int occupied = line.substring(firstComma + 1, secondComma).toInt();
  int total = line.substring(secondComma + 1).toInt();

  postStatus(occupied, total);
}

void postStatus(int occupied, int total)
{
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(BACKEND_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-IOT-API-KEY", IOT_API_KEY);

  String body = String("{\"occupiedSlots\":") + occupied + ",\"totalSlots\":" + total + "}";
  int code = http.POST(body);

  // code > 0 means a response was received (200 = success).
  http.end();
}

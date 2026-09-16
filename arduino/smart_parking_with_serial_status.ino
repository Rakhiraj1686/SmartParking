/*
====================================================
 SMART PARKING SYSTEM (4 SLOTS) — with serial status output
 Arduino UNO + 2 IR Sensors + Servo + I2C LCD
====================================================

This is the ORIGINAL sketch, UNCHANGED in behavior, with exactly one
addition: every time occupiedSlots changes, it prints a line like

    STATUS,2,4

over the USB/hardware serial port (9600 baud), where:
    2 = occupiedSlots
    4 = TOTAL_SLOTS

Nothing about the LCD, gate, or entry/exit logic below was modified.
An ESP8266/ESP32 (see esp_wifi_bridge.ino) or a PC (see serial_bridge.py)
can listen on this same serial line and forward it to:

    POST /api/iot/status
    X-IOT-API-KEY: <your key>
    { "occupiedSlots": 2, "totalSlots": 4 }

The Arduino UNO itself has NO built-in Wi-Fi and does not talk to the
backend directly — it only prints this line.

Entry IR  -> D2
Exit IR   -> D3
Servo     -> D9

LCD SDA   -> A4
LCD SCL   -> A5

Total Capacity = 4 Cars
====================================================
*/

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Servo.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);
Servo gateServo;

#define ENTRY_IR   2
#define EXIT_IR    3
#define SERVO_PIN  9

const int TOTAL_SLOTS = 4;
int occupiedSlots = 0;

bool entryLock = false;
bool exitLock = false;

void setup()
{
  Serial.begin(9600); // added: for STATUS,x,y output only

  pinMode(ENTRY_IR, INPUT);
  pinMode(EXIT_IR, INPUT);

  gateServo.attach(SERVO_PIN);
  gateServo.write(0);

  lcd.init();
  lcd.backlight();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(" SMART PARKING");

  lcd.setCursor(3, 1);
  lcd.print("WELCOME");

  delay(2500);

  updateDisplay();
  sendStatus(); // added
}

void loop()
{
  if (digitalRead(ENTRY_IR) == LOW && !entryLock)
  {
    entryLock = true;

    if (occupiedSlots < TOTAL_SLOTS)
    {
      occupiedSlots++;

      lcd.clear();
      lcd.setCursor(1, 0);
      lcd.print("VEHICLE ENTRY");

      lcd.setCursor(2, 1);
      lcd.print("GATE OPEN");

      gateOpen();

      updateDisplay();
      sendStatus(); // added
    }
    else
    {
      lcd.clear();
      lcd.setCursor(1, 0);
      lcd.print("PARKING FULL");

      lcd.setCursor(2, 1);
      lcd.print("NO ENTRY");

      delay(2500);

      updateDisplay();
    }
  }

  if (digitalRead(ENTRY_IR) == HIGH)
  {
    entryLock = false;
  }

  if (digitalRead(EXIT_IR) == LOW && !exitLock)
  {
    exitLock = true;

    if (occupiedSlots > 0)
    {
      occupiedSlots--;

      lcd.clear();
      lcd.setCursor(1, 0);
      lcd.print("VEHICLE EXIT");

      lcd.setCursor(2, 1);
      lcd.print("GATE OPEN");

      gateOpen();

      updateDisplay();
      sendStatus(); // added
    }
  }

  if (digitalRead(EXIT_IR) == HIGH)
  {
    exitLock = false;
  }
}

void gateOpen()
{
  gateServo.write(90);
  delay(3000);

  gateServo.write(0);
  delay(500);
}

void updateDisplay()
{
  lcd.clear();

  lcd.setCursor(0, 0);
  lcd.print("Occupied:");
  lcd.print(occupiedSlots);

  lcd.setCursor(0, 1);
  lcd.print("Available:");
  lcd.print(TOTAL_SLOTS - occupiedSlots);
}

// added: prints "STATUS,<occupied>,<total>" for a bridge device to read
void sendStatus()
{
  Serial.print("STATUS,");
  Serial.print(occupiedSlots);
  Serial.print(",");
  Serial.println(TOTAL_SLOTS);
}

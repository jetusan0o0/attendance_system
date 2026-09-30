# ESP32 Smart Classroom Attendance System - Firmware

This directory contains the firmware code and wiring specifications for the ESP32 microcontroller to interface with the MFRC522 RFID reader, ST7789 2.4-inch TFT LCD display, and passive buzzer, connecting wirelessly to the Node.js / Express backend.

---

## 1. Hardware Pinout & Wiring Table

| Component | Component Pin | ESP32 GPIO Pin | Description / Notes |
| :--- | :--- | :--- | :--- |
| **MFRC522 RFID** | 3.3V | 3.3V | Power (Do NOT connect to 5V!) |
| | GND | GND | Ground |
| | RST | GPIO 22 | Reset Pin |
| | SDA / SS | GPIO 5 | Chip Select (CS) for RFID |
| | SCK | GPIO 18 | Shared VSPI Clock (SCK) |
| | MOSI | GPIO 23 | Shared VSPI Data Out (MOSI) |
| | MISO | GPIO 19 | VSPI Data In (MISO) |
| | IRQ | Not Connected | Unused |
| **ST7789 2.4" TFT**| VCC | 3.3V or 5V | Depends on display board regulator (usually 3.3V/5V compatible) |
| | GND | GND | Ground |
| | SCL / SCK | GPIO 18 | Shared VSPI Clock (SCK) |
| | SDA / MOSI | GPIO 23 | Shared VSPI Data (MOSI) |
| | RES / RST | GPIO 4 | Display Reset |
| | DC / RS | GPIO 2 | Data/Command selector |
| | CS | GPIO 15 | Chip Select (CS) for TFT LCD |
| | BLK / BL | 3.3V (or GPIO 32) | Backlight (Can connect to 3.3V for always on) |
| **Passive Buzzer** | Positive (+) | GPIO 27 | PWM tone audio feedback |
| | Negative (-) | GND | Ground |

---

## 2. Required Arduino IDE Libraries

Install the following libraries via **Arduino IDE Library Manager** (`Ctrl + Shift + I`):

1. **MFRC522** by *GithubCommunity* (v1.4.10 or later)
2. **Adafruit GFX Library** by *Adafruit* (v1.11.0 or later)
3. **Adafruit ST7735 and ST7789 Library** by *Adafruit* (v1.10.0 or later)
4. **ArduinoJson** by *Benoît Blanchon* (v6.21.0 or v7.x)

---

## 3. Configuration in `esp32_attendance.ino`

Before uploading, configure these variables in the code:

```cpp
// Wi-Fi Credentials
const char* WIFI_SSID     = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Server API Endpoint (IP address of the computer running 'backend')
// Find your PC IP address using 'ipconfig' on Windows (e.g., 192.168.1.100)
const char* SERVER_URL    = "http://192.168.1.100:5000/api/attendance/scan";
const char* TERMINAL_ID   = "GATE_TERMINAL_01";
```

---

## 4. How to Test Without Physical Hardware

If your physical hardware is currently not assembled, the backend and frontend also support testing using the **Hardware Terminal Simulator** integrated directly inside the web dashboard under `http://localhost:5173`.

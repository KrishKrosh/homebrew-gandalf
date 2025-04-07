# Homebrew Gandalf
This is the code to handle the automatic opening of my main apartment door through the internet as opposed to having to the intercom and press a bunch of buttons myself.

It works by two servo motors doing the right combination of button presses on the Aiphone GT-1M3-L/GT-1M3.

I call it Gandalf.

## Features
- ArduinoOTA updates over the network
- Web server to remotely activate stuff
- Secured API endpoints with API key authentication
- Secure credential management with secrets.h
- Modular code organization with separate controller classes
- Physical button support - press the ESP32 flash button to open both doors

## Project Structure

The codebase is organized into modular components:

- `main.cpp` - Main application entry point, handles WiFi, OTA, and HTTP server
- `secrets.h` - Contains sensitive configuration (not committed to version control)
- `ServoController.h` - Handles all servo motor operations for door control
- `ButtonHandler.h` - Manages physical button interactions with debouncing
- `extract_secrets.py` - Helper script for secure OTA password handling

## Physical Controls

In addition to the API endpoints, you can also control the door using physical inputs:

- **Flash Button**: Press the built-in flash button on the ESP32 board to open both doors
  - This is the button labeled "BOOT" or "FLASH" on most ESP32 development boards
  - The button is connected to GPIO0
  - Includes software debouncing to prevent accidental double-triggering

## Environment Configuration

This project uses a secrets.h file to store sensitive information like WiFi credentials and authentication details. Follow these steps to set up your environment:

1. Copy the example file to create your secrets file:
   ```
   cp embedded/src/secrets.h.example embedded/src/secrets.h
   ```

2. Edit embedded/src/secrets.h with your actual credentials:
   ```cpp
   // WiFi credentials
   const char* WIFI_SSID = "your_wifi_ssid";
   const char* WIFI_PASSWORD = "your_wifi_password";
   
   // ArduinoOTA authentication
   const char* OTA_PASSWORD = "your_ota_password";
   
   // API authentication
   const char* API_KEY = "your_random_api_key"; // Generate a strong random string
   ```

3. The secrets.h file is ignored by git (added to .gitignore) to prevent accidentally committing sensitive information.

## PlatformIO Setup for OTA Updates

To use ArduinoOTA with PlatformIO in VSCode, follow these steps:

### Initial Setup

1. Make sure you have PlatformIO extension installed in VSCode
2. The project's `platformio.ini` is configured to securely handle OTA:

```ini
[env:esp32dev]
platform = espressif32
board = esp32dev
framework = arduino
monitor_speed = 115200

; Import custom Python script to extract OTA password from secrets.h
extra_scripts = extract_secrets.py

; For initial upload via serial
upload_protocol = esptool
upload_port = /dev/cu.SLAB_USBtoUART  ; Adjust this to your serial port

; For OTA uploads (uncomment after initial upload)
; upload_protocol = espota
; upload_port = gandalf.local
; upload_flags = ${env:esp32dev.ota_flags}  ; Password is extracted from secrets.h
```

### Security Feature

This project uses a special approach to avoid storing passwords in platformio.ini:

1. The OTA password is stored only in your `secrets.h` file
2. A Python script (`extract_secrets.py`) reads the password at build time
3. PlatformIO uses this password for OTA updates without storing it in any committed files
4. This means your password is never stored in plaintext in version control

### First Upload

For the first upload (to install ArduinoOTA code), you must use the serial connection:

1. Connect your ESP32 via USB
2. Click the PlatformIO upload button or run:
   ```
   pio run -t upload
   ```

### Subsequent OTA Updates

After the initial upload, you can deploy updates wirelessly:

1. Ensure your computer is on the same network as the ESP32
2. Uncomment the OTA upload section in platformio.ini and comment out the serial section
3. Update the project code as needed
4. Click the PlatformIO upload button - it will now use OTA with the password from secrets.h
5. You can also use the command line:
   ```
   pio run -t upload
   ```

### Troubleshooting OTA Updates

If you're having issues with OTA uploads:

1. Verify the ESP32 is powered and connected to your network
2. Check that the IP address in platformio.ini matches the device's current IP
3. If using mDNS (hostname), make sure your computer supports mDNS (Windows may require Bonjour)
4. Try pinging the device to verify connectivity:
   ```
   ping gandalf.local
   ```
   or
   ```
   ping 192.168.1.100
   ```
5. The ESP32 must have enough memory available for the OTA update
6. The ESP32 security settings might block OTA updates if the password is incorrect

## API Documentation

The server exposes several endpoints to control the door servos:

- `/openFirstDoor` - Opens the first door
- `/openSecondDoor` - Opens the second door
- `/openBothDoors` - Opens both doors in sequence

### Authentication

All API endpoints require authentication using an API key. You can provide the API key in one of the following ways:

1. As a URL parameter:
   ```
   http://<device-ip>/openFirstDoor?key=your_api_key
   ```

2. As a Bearer token in the Authorization header:
   ```
   Authorization: Bearer your_api_key
   ```

3. Directly in the Authorization header:
   ```
   Authorization: your_api_key
   ```

Example using curl:
```bash
# Using URL parameter
curl "http://<device-ip>/openFirstDoor?key=your_api_key"

# Using Authorization header
curl -H "Authorization: Bearer your_api_key" http://<device-ip>/openFirstDoor
```

## Setup and Installation

... 
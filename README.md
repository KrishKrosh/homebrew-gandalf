# Homebrew Gandolf
This is the code to handle the automatic opening of my main apartment door through the internet as opposed to having to the intercom and press a bunch of buttons myself.

It works by two servo motors doing the right combination of button presses on the Aiphone GT-1M3-L/GT-1M3.

I call it Gandolf.

## Features
- OTA updates
- Web server to remotely activate stuff
- Secured API endpoints with API key authentication

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
   
   // OTA authentication
   const char* OTA_USERNAME = "your_ota_username";
   const char* OTA_PASSWORD = "your_ota_password";
   
   // API authentication
   const char* API_KEY = "your_random_api_key"; // Generate a strong random string
   ```

3. The secrets.h file is ignored by git (added to .gitignore) to prevent accidentally committing sensitive information.

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
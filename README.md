# Homebrew Gandolf

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
   ```

3. The secrets.h file is ignored by git (added to .gitignore) to prevent accidentally committing sensitive information.

## Setup and Installation

... 
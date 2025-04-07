#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <ArduinoOTA.h>

#include <Arduino.h>
#include "secrets.h" // Include secrets header file
#include "ServoController.h" // Include our Servo Controller
#include "ButtonHandler.h" // Include our Button Handler

// Flash button pin (typically GPIO0 on most ESP32 dev boards)
#define FLASH_BUTTON_PIN 0
 
// Use credentials from secrets.h
const char* ssid = WIFI_SSID;
const char* password = WIFI_PASSWORD;

// Uncomment to use alternative credentials
// const char* ssid = ALT_WIFI_SSID;
// const char* password = ALT_WIFI_PASSWORD;
 
WebServer server(80);

// Create a ServoController instance
ServoController servoCtrl;

// Create a ButtonHandler instance for the flash button
ButtonHandler flashButton(FLASH_BUTTON_PIN);

// Function to validate the API key
bool isValidApiKey() {
  // Check if API key is provided as a URL parameter
  if (server.hasArg("key")) {
    if (server.arg("key") == API_KEY) {
      return true;
    }
  }
  
  // Check if API key is provided in the Authorization header
  if (server.hasHeader("Authorization")) {
    String authHeader = server.header("Authorization");
    // Check if it starts with "Bearer " and then matches our API key
    if (authHeader.startsWith("Bearer ") && authHeader.substring(7) == API_KEY) {
      return true;
    }
    // Also check for direct API key in the header
    if (authHeader == API_KEY) {
      return true;
    }
  }

  // If no valid API key found
  return false;
}

// Handle unauthorized access
void handleUnauthorized() {
  server.send(401, "text/plain", "Unauthorized: Invalid or missing API key");
}

// Function to handle button press - will open both doors
void handleButtonPress() {
  Serial.println("Button press detected - opening both doors");
  servoCtrl.openBothDoors();
}

void setup(void) {
  Serial.begin(115200);
  Serial.println("Gandalf Door Controller starting...");

  // Initialize the servo controller
  servoCtrl.begin();
  
  // Initialize the button handler and set the callback function
  flashButton.begin();
  flashButton.setOnPressCallback(handleButtonPress);
  Serial.println("Flash button configured to open both doors");

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
 
  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // Set up mDNS responder:
  // - first argument is the domain name, in this case, 'gandalf'
  // - second argument is the IP address to advertise
  if (!MDNS.begin("gandalf")) {
    Serial.println("Error setting up MDNS responder!");
  } else {
    Serial.println("mDNS responder started");
    // Add service to MDNS-SD
    MDNS.addService("http", "tcp", 80);
  }

  // ArduinoOTA setup
  // Port defaults to 3232
  ArduinoOTA.setPort(3232);
  
  // Hostname defaults to esp3232-[MAC]
  ArduinoOTA.setHostname("gandalf");
  
  // Set authentication password
  ArduinoOTA.setPassword(OTA_PASSWORD);
  
  // OTA callbacks
  ArduinoOTA.onStart([]() {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH)
      type = "sketch";
    else // U_SPIFFS
      type = "filesystem";
    
    // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
    Serial.println("Start updating " + type);
  });
  
  ArduinoOTA.onEnd([]() {
    Serial.println("\nEnd");
  });
  
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
  });
  
  ArduinoOTA.begin();
  Serial.println("OTA service started");
 
  server.on("/", []() {
    server.send(200, "text/plain", "Hi! This is Gandalf Door Controller.");
  });

  server.on("/openFirstDoor", []() {
    // Check if the request has a valid API key
    if (!isValidApiKey()) {
      handleUnauthorized();
      return;
    }
    
    server.send(200, "text/plain", "Wait ~10 seconds for the first door to open");
    servoCtrl.openFirstDoor();
  });

  server.on("/openSecondDoor", []() {
    // Check if the request has a valid API key
    if (!isValidApiKey()) {
      handleUnauthorized();
      return;
    }
    
    server.send(200, "text/plain", "Wait ~10 seconds for the second door to open");
    servoCtrl.openSecondDoor();
  });

  server.on("/openBothDoors", []() {
    // Check if the request has a valid API key
    if (!isValidApiKey()) {
      handleUnauthorized();
      return;
    }
    
    server.send(200, "text/plain", "Wait ~20 seconds for both doors to open");
    servoCtrl.openBothDoors();
  });

  server.begin();
  Serial.println("HTTP server started");
  Serial.println("Gandalf is ready!");
}
 
void loop(void) {
  ArduinoOTA.handle();
  server.handleClient();
  
  // Check for button press
  flashButton.handle();
}

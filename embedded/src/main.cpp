#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <ElegantOTA.h>

#include <ESP32Servo.h>
#include <Arduino.h>
#include "secrets.h" // Include secrets header file


 
// Use credentials from secrets.h
const char* ssid = WIFI_SSID;
const char* password = WIFI_PASSWORD;

// Uncomment to use alternative credentials
// const char* ssid = ALT_WIFI_SSID;
// const char* password = ALT_WIFI_PASSWORD;
 
WebServer server(80);

Servo rightServo;  // create servo object to control a servo
                // 16 servo objects can be created on the ESP32
Servo leftServo;

int pos = 0;    // variable to store the servo position
// Recommended PWM GPIO pins on the ESP32 include 2,4,12-19,21-23,25-27,32-33 
int servoPin1 = 32;
int servoPin2 = 33;

int RIGHT_DEFAULT_ANGLE = 45;
int RIGHT_PRESSED_ANGLE = 65;
int LEFT_DEFAULT_ANGLE = 45;
int LEFT_PRESSED_ANGLE = 30;

int PRESS_DELAY = 200;
int STANDARD_DELAY = 3000;

void openFirstDoor() {
  Serial.println("openFirstDoor");
  // starting state
  rightServo.write(RIGHT_DEFAULT_ANGLE);
  leftServo.write(LEFT_DEFAULT_ANGLE);

  // left press turns screen on
  leftServo.write(LEFT_PRESSED_ANGLE);
  delay(PRESS_DELAY);
  leftServo.write(LEFT_DEFAULT_ANGLE);
  delay(STANDARD_DELAY);

  // right press turns on speaker
  rightServo.write(RIGHT_PRESSED_ANGLE);
  delay(PRESS_DELAY);
  rightServo.write(RIGHT_DEFAULT_ANGLE);
  delay(STANDARD_DELAY);

  // left press opens door
  leftServo.write(LEFT_PRESSED_ANGLE);
  delay(PRESS_DELAY);
  leftServo.write(LEFT_DEFAULT_ANGLE);
  delay(STANDARD_DELAY);

  // right press closes screen
  rightServo.write(RIGHT_PRESSED_ANGLE);
  delay(PRESS_DELAY);
  rightServo.write(RIGHT_DEFAULT_ANGLE);
  delay(STANDARD_DELAY);
  Serial.println("openFirstDoor done");
}

void openSecondDoor() {
  Serial.println("openSecondDoor");
  // starting state
  leftServo.write(LEFT_DEFAULT_ANGLE);
  rightServo.write(RIGHT_DEFAULT_ANGLE);

  // left press
  leftServo.write(LEFT_PRESSED_ANGLE);
  delay(PRESS_DELAY);
  leftServo.write(LEFT_DEFAULT_ANGLE);
  delay(STANDARD_DELAY);

  // left press twice opens screen to second door
  leftServo.write(LEFT_PRESSED_ANGLE);
  delay(PRESS_DELAY);
  leftServo.write(LEFT_DEFAULT_ANGLE);
  delay(STANDARD_DELAY);

  // right press turns on speaker
  rightServo.write(RIGHT_PRESSED_ANGLE);
  delay(PRESS_DELAY);
  rightServo.write(RIGHT_DEFAULT_ANGLE);
  delay(STANDARD_DELAY);

  // left press opens second door
  leftServo.write(LEFT_PRESSED_ANGLE);
  delay(PRESS_DELAY);
  leftServo.write(LEFT_DEFAULT_ANGLE);
  delay(STANDARD_DELAY);

  // right press closes screen
  rightServo.write(RIGHT_PRESSED_ANGLE);
  delay(PRESS_DELAY);
  rightServo.write(RIGHT_DEFAULT_ANGLE);
  delay(STANDARD_DELAY);

  Serial.println("openSecondDoor done");
}


void setup(void) {

  pinMode(servoPin1, OUTPUT);
  pinMode(servoPin2, OUTPUT);
  rightServo.attach(servoPin1); 
  leftServo.attach(servoPin2);

  Serial.begin(115200);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  Serial.println("");
 
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
 
  server.on("/", []() {
    server.send(200, "text/plain", "Hi! This is ElegantOTA Demo.");
  });

  server.on("/openFirstDoor", []() {
    server.send(200, "text/plain", "Wait ~10 seconds for the first door to open");
    openFirstDoor();
  });

  server.on("/openSecondDoor", []() {
    server.send(200, "text/plain", "Wait ~10 seconds for the second door to open");
    openSecondDoor();
  });

  server.on("/openBothDoors", []() {
    server.send(200, "text/plain", "Wait ~20 seconds for both doors to open");
    openFirstDoor();
    delay(STANDARD_DELAY);
    openSecondDoor();
  });

  // Use OTA credentials from secrets.h
  ElegantOTA.setAuth(OTA_USERNAME, OTA_PASSWORD);
  ElegantOTA.begin(&server);    // Start ElegantOTA
  server.begin();
  Serial.println("HTTP server started");
}
 
void loop(void) {
  server.handleClient();
  ElegantOTA.loop();
}

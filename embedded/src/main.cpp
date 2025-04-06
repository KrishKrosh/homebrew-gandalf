#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <ElegantOTA.h>

#include <ESP32Servo.h>
#include <Arduino.h>


 
const char* ssid = "homebrew";
const char* password = "codebrew@42";

// const char* ssid = "SpectrumSetup-37";
// const char* password = "epicnest826";
 
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
    openFirstDoor();
    server.send(200, "text/plain", "Wait ~10 seconds for the first door to open");
  });

  server.on("/openSecondDoor", []() {
    openSecondDoor();
    server.send(200, "text/plain", "Wait ~10 seconds for the second door to open");
  });

  server.on("/openBothDoors", []() {
    openFirstDoor();
    delay(STANDARD_DELAY);
    openSecondDoor();
    server.send(200, "text/plain", "Wait ~20 seconds for both doors to open");
  });

  ElegantOTA.setAuth("homebrew", "codebrew@42");
  ElegantOTA.begin(&server);    // Start ElegantOTA
  server.begin();
  Serial.println("HTTP server started");
}
 
void loop(void) {
  server.handleClient();
  ElegantOTA.loop();
}

/*
  Example from WiFi > WiFiScan
  Complete details at https://RandomNerdTutorials.com/esp32-useful-wi-fi-functions-arduino/
*/

// #include "WiFi.h"

// void setup() {
//   Serial.begin(115200);

//   // Set WiFi to station mode and disconnect from an AP if it was previously connected
//   WiFi.mode(WIFI_STA);
//   WiFi.disconnect();
//   delay(100);

//   Serial.println("Setup done");
// }

// void loop() {
//   Serial.println("scan start");

//   // WiFi.scanNetworks will return the number of networks found
//   int n = WiFi.scanNetworks();
//   Serial.println("scan done");
//   if (n == 0) {
//       Serial.println("no networks found");
//   } else {
//     Serial.print(n);
//     Serial.println(" networks found");
//     for (int i = 0; i < n; ++i) {
//       // Print SSID and RSSI for each network found
//       Serial.print(i + 1);
//       Serial.print(": ");
//       Serial.print(WiFi.SSID(i));
//       Serial.print(" (");
//       Serial.print(WiFi.RSSI(i));
//       Serial.print(")");
//       Serial.println((WiFi.encryptionType(i) == WIFI_AUTH_OPEN)?" ":"*");
//       Serial.print(" Ch:");
//       Serial.println(WiFi.channel(i));
//       delay(10);
//     }
//   }
//   Serial.println("");

//   // Wait a bit before scanning again
//   delay(5000);
// }
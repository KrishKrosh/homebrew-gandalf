#ifndef SERVO_CONTROLLER_H
#define SERVO_CONTROLLER_H

#include <ESP32Servo.h>
#include <Arduino.h>

class ServoController {
private:
    Servo rightServo;  // servo object to control the right servo
    Servo leftServo;   // servo object to control the left servo
    
    // Pin configuration
    int servoPin1; // right servo pin
    int servoPin2; // left servo pin
    
    // Angle configuration
    int RIGHT_DEFAULT_ANGLE;
    int RIGHT_PRESSED_ANGLE;
    int LEFT_DEFAULT_ANGLE;
    int LEFT_PRESSED_ANGLE;
    
    // Timing configuration
    int PRESS_DELAY;
    int STANDARD_DELAY;
    int SHORT_DELAY;

public:
    // Constructor with default values
    ServoController(
        int pin1 = 32, 
        int pin2 = 33, 
        int rightDefault = 45, 
        int rightPressed = 65, 
        int leftDefault = 45, 
        int leftPressed = 30, 
        int pressDelay = 200, 
        int standardDelay = 3000,
        int shortDelay = 1000
    ) : 
        servoPin1(pin1),
        servoPin2(pin2),
        RIGHT_DEFAULT_ANGLE(rightDefault),
        RIGHT_PRESSED_ANGLE(rightPressed),
        LEFT_DEFAULT_ANGLE(leftDefault),
        LEFT_PRESSED_ANGLE(leftPressed),
        PRESS_DELAY(pressDelay),
        STANDARD_DELAY(standardDelay),
        SHORT_DELAY(shortDelay)
    {}

    // Initialize the servos
    void begin() {
        pinMode(servoPin1, OUTPUT);
        pinMode(servoPin2, OUTPUT);
        rightServo.attach(servoPin1);
        leftServo.attach(servoPin2);
        
        // Set to default positions
        rightServo.write(RIGHT_DEFAULT_ANGLE);
        leftServo.write(LEFT_DEFAULT_ANGLE);
        
        Serial.println("Servo controller initialized");
    }

    // Open the first door
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
        delay(SHORT_DELAY);

        // left press opens door
        leftServo.write(LEFT_PRESSED_ANGLE);
        delay(PRESS_DELAY);
        leftServo.write(LEFT_DEFAULT_ANGLE);
        delay(SHORT_DELAY);

        // right press closes screen
        rightServo.write(RIGHT_PRESSED_ANGLE);
        delay(PRESS_DELAY);
        rightServo.write(RIGHT_DEFAULT_ANGLE);
        Serial.println("openFirstDoor done");
    }

    // Open the second door
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

    void openBothDoors() {
        Serial.println("openBothDoors");
        openFirstDoor();
        delay(SHORT_DELAY);
        openSecondDoor();
        Serial.println("openBothDoors done");
    }
};

#endif // SERVO_CONTROLLER_H 
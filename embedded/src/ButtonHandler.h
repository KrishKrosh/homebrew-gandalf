#ifndef BUTTON_HANDLER_H
#define BUTTON_HANDLER_H

#include <Arduino.h>

class ButtonHandler {
private:
    // GPIO pin connected to the button
    int buttonPin;
    
    // Last state of the button
    int lastButtonState;
    
    // Debounce variables
    unsigned long lastDebounceTime;
    unsigned long debounceDelay;
    
    // Flag to ensure action only happens once per press
    bool actionTaken;
    
    // Callback function type
    typedef void (*ButtonCallback)();
    
    // Callback function to execute when button is pressed
    ButtonCallback onPressCallback;

public:
    // Constructor
    ButtonHandler(int pin = 0, unsigned long delay = 50) : 
        buttonPin(pin),
        lastButtonState(HIGH),
        lastDebounceTime(0),
        debounceDelay(delay),
        actionTaken(false),
        onPressCallback(nullptr)
    {}
    
    // Initialize the button
    void begin() {
        // Set the button pin as input with internal pull-up resistor
        pinMode(buttonPin, INPUT_PULLUP);
        Serial.println("Button handler initialized on pin " + String(buttonPin));
    }
    
    // Set the callback function
    void setOnPressCallback(ButtonCallback callback) {
        onPressCallback = callback;
    }
    
    // Check button state and handle press events
    void handle() {
        // Read the current button state (inverted because of pull-up resistor)
        int reading = digitalRead(buttonPin);
        
        // If the button state changed
        if (reading != lastButtonState) {
            // Reset the debounce timer
            lastDebounceTime = millis();
            actionTaken = false;
        }
        
        // If enough time has passed to debounce
        if ((millis() - lastDebounceTime) > debounceDelay) {
            // If the button is pressed (LOW with pull-up resistor) and no action taken yet
            if (reading == LOW && !actionTaken) {
                Serial.println("Flash button pressed");
                
                // If a callback is registered, execute it
                if (onPressCallback != nullptr) {
                    onPressCallback();
                }
                
                // Mark that we've taken action for this press
                actionTaken = true;
            }
        }
        
        // Save the button state for next time
        lastButtonState = reading;
    }
};

#endif // BUTTON_HANDLER_H 
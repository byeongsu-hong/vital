/**
 * Vital Sense - Arduino Heart Rate Sensor
 * 
 * Supports multiple heart rate sensor types:
 * - MAX30102/MAX30100 Pulse Oximeter & Heart Rate Sensor (I2C)
 * - Pulse Sensor (Analog)
 * 
 * Sends BPM data over Serial at 9600 baud
 * Compatible with the Web Serial API adapter
 * 
 * Configuration: Edit config.h to customize behavior
 */

#include <Wire.h>
#include "config.h"
#include "MAX30105.h"
#include "heartRate.h"

// ===== SENSOR INSTANCES =====
#ifdef SENSOR_TYPE_MAX30102
MAX30105 particleSensor;

byte rates[MAX30102_RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute;
int beatAvg;
#endif

// ===== TIMING =====
unsigned long lastBpmSent = 0;
int currentBpm = 0;
bool sensorInitialized = false;

void setup() {
  Serial.begin(SERIAL_BAUD_RATE);
  
  // Wait for serial connection
  delay(STARTUP_DELAY_MS);
  
  Serial.println("Vital Sense Heart Rate Monitor");
  Serial.println("Initializing sensor...");
  
  #ifdef SENSOR_TYPE_MAX30102
    initMAX30102();
  #else
    initPulseSensor();
  #endif
  
  if (sensorInitialized) {
    Serial.println("Sensor ready!");
  } else {
    Serial.println("ERROR: Sensor initialization failed");
  }
}

void loop() {
  if (!sensorInitialized) {
    delay(1000);
    return;
  }
  
  #ifdef SENSOR_TYPE_MAX30102
    readMAX30102();
  #else
    readPulseSensor();
  #endif
  
  // Send BPM at regular intervals
  if (millis() - lastBpmSent >= BPM_UPDATE_INTERVAL) {
    if (currentBpm > 0) {
      sendBPM(currentBpm);
    }
    lastBpmSent = millis();
  }
}

// ===== MAX30102 SENSOR FUNCTIONS =====
#ifdef SENSOR_TYPE_MAX30102

void initMAX30102() {
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 not found. Check wiring!");
    sensorInitialized = false;
    return;
  }
  
  // Configure sensor with default settings
  particleSensor.setup();
  particleSensor.setPulseAmplitudeRed(LED_BRIGHTNESS_RED);
  particleSensor.setPulseAmplitudeGreen(LED_BRIGHTNESS_GREEN);
  
  sensorInitialized = true;
}

void readMAX30102() {
  long irValue = particleSensor.getIR();
  
  // Check if a finger is detected
  if (irValue < FINGER_DETECTION_THRESHOLD) {
    // No finger detected
    beatsPerMinute = 0;
    beatAvg = 0;
    return;
  }
  
  // Check for heartbeat
  if (checkForBeat(irValue)) {
    long delta = millis() - lastBeat;
    lastBeat = millis();
    
    beatsPerMinute = 60 / (delta / 1000.0);
    
    // Filter out unrealistic values
    if (beatsPerMinute < 255 && beatsPerMinute > 20) {
      rates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot %= MAX30102_RATE_SIZE;
      
      // Calculate average
      beatAvg = 0;
      for (byte x = 0; x < MAX30102_RATE_SIZE; x++) {
        beatAvg += rates[x];
      }
      beatAvg /= MAX30102_RATE_SIZE;
      
      currentBpm = beatAvg;
    }
  }
}

#endif

// ===== ANALOG PULSE SENSOR FUNCTIONS =====
#ifndef SENSOR_TYPE_MAX30102

int pulseSignal;
unsigned long lastPulseTime = 0;
int bpmReadings[PULSE_SENSOR_AVERAGE_SIZE];
int bpmIndex = 0;
bool pulseDetected = false;

void initPulseSensor() {
  pinMode(PULSE_SENSOR_PIN, INPUT);
  sensorInitialized = true;
}

void readPulseSensor() {
  pulseSignal = analogRead(PULSE_SENSOR_PIN);
  
  // Simple threshold-based pulse detection
  if (pulseSignal > PULSE_THRESHOLD && !pulseDetected) {
    pulseDetected = true;
    unsigned long currentTime = millis();
    
    if (lastPulseTime > 0) {
      unsigned long pulseDuration = currentTime - lastPulseTime;
      
      // Calculate BPM from time between pulses
      int bpm = 60000 / pulseDuration;
      
      // Filter realistic values
      if (bpm >= MIN_BPM && bpm <= MAX_BPM) {
        // Store in rolling average buffer
        bpmReadings[bpmIndex] = bpm;
        bpmIndex = (bpmIndex + 1) % PULSE_SENSOR_AVERAGE_SIZE;
        
        // Calculate average
        int sum = 0;
        int count = 0;
        for (int i = 0; i < PULSE_SENSOR_AVERAGE_SIZE; i++) {
          if (bpmReadings[i] > 0) {
            sum += bpmReadings[i];
            count++;
          }
        }
        
        if (count > 0) {
          currentBpm = sum / count;
        }
      }
    }
    
    lastPulseTime = currentTime;
  } else if (pulseSignal < PULSE_THRESHOLD) {
    pulseDetected = false;
  }
  
  delay(ANALOG_READ_DELAY);
}

#endif

// ===== SERIAL COMMUNICATION =====
void sendBPM(int bpm) {
  // Validate BPM range
  if (bpm < MIN_BPM || bpm > MAX_BPM) {
    DEBUG_PRINTLN("BPM out of range");
    return;
  }
  
  DEBUG_PRINT("Sending BPM: ");
  DEBUG_PRINTLN(bpm);
  
  // Send in the format expected by web-serial-adapter.ts
  Serial.println(bpm);
}


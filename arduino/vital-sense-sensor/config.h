/**
 * Configuration Header
 * 
 * Centralized configuration for the Vital Sense sensor firmware
 * Edit these values to customize behavior without modifying main code
 */

#ifndef CONFIG_H
#define CONFIG_H

// ===== SENSOR CONFIGURATION =====

// Uncomment ONE sensor type
#define SENSOR_TYPE_MAX30102
// #define SENSOR_TYPE_PULSE_ANALOG

// ===== PIN CONFIGURATION =====

// For analog pulse sensor
#define PULSE_SENSOR_PIN A0

// I2C pins are standard (A4=SDA, A5=SCL on Uno)
// No configuration needed for MAX30102

// ===== TIMING CONFIGURATION =====

// How often to send BPM updates (milliseconds)
#define BPM_UPDATE_INTERVAL 1000

// Sampling rate for analog sensor (Hz)
#define SAMPLING_RATE 100

// ===== SERIAL CONFIGURATION =====

// Baud rate for serial communication
// MUST match web-serial-adapter.ts (9600)
#define SERIAL_BAUD_RATE 9600

// ===== FILTERING CONFIGURATION =====

// Valid BPM range
#define MIN_BPM 30
#define MAX_BPM 250

// Number of readings to average (MAX30102)
#define MAX30102_RATE_SIZE 4

// Number of readings to average (Pulse Sensor)
#define PULSE_SENSOR_AVERAGE_SIZE 5

// ===== MAX30102 SENSOR CONFIGURATION =====

#ifdef SENSOR_TYPE_MAX30102

// LED brightness (0x00 to 0xFF)
// Lower = less power, may need adjustment based on skin tone
#define LED_BRIGHTNESS_RED 0x0A
#define LED_BRIGHTNESS_GREEN 0x00

// Threshold for finger detection (IR value)
#define FINGER_DETECTION_THRESHOLD 50000

#endif

// ===== PULSE SENSOR CONFIGURATION =====

#ifdef SENSOR_TYPE_PULSE_ANALOG

// Threshold for pulse detection (0-1023)
// Adjust based on your specific sensor and placement
#define PULSE_THRESHOLD 550

// Delay between analog reads (milliseconds)
#define ANALOG_READ_DELAY 10

#endif

// ===== DEBUG CONFIGURATION =====

// Enable debug output (comment out for production)
// #define DEBUG_MODE

// Debug print macro
#ifdef DEBUG_MODE
  #define DEBUG_PRINT(x) Serial.print(x)
  #define DEBUG_PRINTLN(x) Serial.println(x)
#else
  #define DEBUG_PRINT(x)
  #define DEBUG_PRINTLN(x)
#endif

// ===== ADVANCED CONFIGURATION =====

// Enable status LED on pin 13
// #define ENABLE_STATUS_LED

// Enable startup delay for sensor stabilization
#define STARTUP_DELAY_MS 1000

// Timeout for initial sensor detection (milliseconds)
#define SENSOR_INIT_TIMEOUT 5000

#endif // CONFIG_H


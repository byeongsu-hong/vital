/**
 * MAX30102 Sensor Test
 * 
 * Tests basic connectivity and readings from MAX30102
 * Requires: SparkFun MAX3010x library
 * 
 * Install via Library Manager: "SparkFun MAX3010x"
 */

#include <Wire.h>
#include "MAX30105.h"

MAX30105 particleSensor;

void setup() {
  Serial.begin(9600);
  Serial.println("MAX30102 Test");
  
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("ERROR: MAX30102 not found!");
    Serial.println("Check wiring:");
    Serial.println("  VIN -> 3.3V or 5V");
    Serial.println("  GND -> GND");
    Serial.println("  SDA -> A4 (Uno)");
    Serial.println("  SCL -> A5 (Uno)");
    while (1);
  }
  
  Serial.println("MAX30102 found!");
  
  particleSensor.setup();
  particleSensor.setPulseAmplitudeRed(0x0A);
  particleSensor.setPulseAmplitudeGreen(0);
  
  Serial.println("Place finger on sensor...");
}

void loop() {
  long irValue = particleSensor.getIR();
  long redValue = particleSensor.getRed();
  
  Serial.print("IR=");
  Serial.print(irValue);
  Serial.print(" Red=");
  Serial.print(redValue);
  
  if (irValue < 50000) {
    Serial.println(" No finger detected");
  } else {
    Serial.println(" Finger detected!");
  }
  
  delay(100);
}


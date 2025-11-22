/**
 * MAX30105 Particle Sensor Library Stub
 * 
 * This is a minimal interface stub. For the full implementation,
 * install the SparkFun MAX3010x library from Arduino Library Manager:
 * 
 * Library Manager -> Search "SparkFun MAX3010x" -> Install
 * 
 * Or download from: https://github.com/sparkfun/SparkFun_MAX3010x_Sensor_Library
 */

#ifndef MAX30105_H
#define MAX30105_H

#include "Arduino.h"
#include <Wire.h>

#define I2C_SPEED_STANDARD 100000
#define I2C_SPEED_FAST 400000

class MAX30105 {
public:
  bool begin(TwoWire &wirePort = Wire, uint32_t i2cSpeed = I2C_SPEED_STANDARD, uint8_t i2caddr = 0x57);
  
  void setup(byte powerLevel = 0x1F, byte sampleAverage = 4, byte ledMode = 3, 
             int sampleRate = 100, int pulseWidth = 411, int adcRange = 4096);
  
  uint32_t getRed();
  uint32_t getIR();
  uint32_t getGreen();
  
  void setPulseAmplitudeRed(uint8_t amplitude);
  void setPulseAmplitudeIR(uint8_t amplitude);
  void setPulseAmplitudeGreen(uint8_t amplitude);
  
private:
  TwoWire *_i2cPort;
};

#endif


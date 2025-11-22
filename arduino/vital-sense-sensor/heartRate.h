/**
 * Heart Rate Detection Algorithm
 * 
 * Simple beat detection using derivative threshold
 * Based on the SparkFun MAX3010x library
 */

#ifndef HEARTRATE_H
#define HEARTRATE_H

#include "Arduino.h"

bool checkForBeat(int32_t sample) {
  static int32_t lastSample = 0;
  static int32_t derivative = 0;
  static int32_t lastDerivative = 0;
  
  // Calculate first derivative
  derivative = sample - lastSample;
  lastSample = sample;
  
  // Look for a rising edge (positive to negative derivative transition)
  // This indicates the peak of a heartbeat
  if (derivative > 100 && lastDerivative <= 100) {
    lastDerivative = derivative;
    return true;
  }
  
  lastDerivative = derivative;
  return false;
}

#endif


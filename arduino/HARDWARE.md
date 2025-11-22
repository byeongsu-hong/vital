# Hardware Guide

## Sensor Comparison

| Feature        | MAX30102 ⭐          | Pulse Sensor     |
| -------------- | -------------------- | ---------------- |
| **Accuracy**   | ±2 BPM               | ±5-10 BPM        |
| **Price**      | $5-10                | $20-25           |
| **Interface**  | I2C (4 wires)        | Analog (3 wires) |
| **Difficulty** | Medium               | Easy             |
| **Best for**   | Production, accuracy | Learning, demos  |

## Compatible Boards

| Board     | MAX30102 | Pulse Sensor | Notes                   |
| --------- | -------- | ------------ | ----------------------- |
| Uno/Nano  | ✅       | ✅           | Recommended             |
| Mega 2560 | ✅       | ✅           | Use pins 20/21 for I2C  |
| ESP32     | ⚠️       | ✅           | Need 3.3V level shifter |
| Due       | ⚠️       | ✅           | 3.3V I2C only           |

## Wiring

### MAX30102

```
VIN → 5V   GND → GND   SDA → A4   SCL → A5
```

### Pulse Sensor

```
Red → 5V   Black → GND   Purple → A0
```

### I2C Pins by Board

- **Uno/Nano**: A4 (SDA), A5 (SCL)
- **Mega**: 20 (SDA), 21 (SCL)
- **Leonardo**: 2 (SDA), 3 (SCL)

## Shopping List

**Budget (~$10)**: Uno clone + MAX30102 (AliExpress)  
**Quality (~$35)**: Official Uno + SparkFun MAX30101 (Arduino.cc)

## Usage Tips

- Place finger gently (don't press hard)
- Wait 10 seconds for stable reading
- Shield sensor from bright light
- Keep hand still

## Troubleshooting

**Sensor not detected:**

```cpp
// Run I2C scanner - MAX30102 should show at 0x57
#include <Wire.h>
void setup() {
  Wire.begin(); Serial.begin(9600);
  for(byte i=1; i<127; i++) {
    Wire.beginTransmission(i);
    if(Wire.endTransmission() == 0) {
      Serial.print("Found: 0x"); Serial.println(i, HEX);
    }
  }
}
void loop() {}
```

**No reading:** Wait 15s, try different finger, increase LED brightness in `config.h`

**Erratic values:** Keep still, shield from light, check connections

**USB issues:** Install CH340 drivers (clones), try different cable

## Resources

- [MAX30102 Datasheet](https://datasheets.maximintegrated.com/en/ds/MAX30102.pdf)
- [SparkFun Library](https://github.com/sparkfun/SparkFun_MAX3010x_Sensor_Library)
- [Arduino Forums](https://forum.arduino.cc/)

⚠️ **Educational use only - not a medical device**

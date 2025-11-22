# Vital Sense - Arduino Heart Rate Sensor

Arduino firmware for real-time heart rate monitoring via USB serial.

## Quick Start

1. **Wire sensor** (MAX30102 recommended, ~$5):

   ```
   VIN → 5V  |  GND → GND  |  SDA → A4  |  SCL → A5
   ```

2. **Install library**: Tools → Manage Libraries → "SparkFun MAX3010x" → Install

3. **Configure**: Edit `config.h` to select sensor type

4. **Upload**: Open `vital-sense-sensor.ino` → Select board & port → Upload

5. **Test**: Tools → Serial Monitor (9600 baud) → Place finger on sensor

6. **Connect to web**: Select "Arduino USB" in the web app → Connect

See [QUICK_START.md](./QUICK_START.md) for detailed walkthrough.

## Supported Hardware

| Sensor          | Type   | Accuracy | Price | Wiring                          |
| --------------- | ------ | -------- | ----- | ------------------------------- |
| **MAX30102** ⭐ | I2C    | ±2 BPM   | ~$5   | VIN→5V, GND→GND, SDA→A4, SCL→A5 |
| Pulse Sensor    | Analog | ±5 BPM   | ~$20  | Red→5V, Black→GND, Purple→A0    |

**Boards**: Uno, Nano, Mega (ESP32 compatible with level shifter)

## Configuration

Edit `config.h`:

```cpp
// Select sensor
#define SENSOR_TYPE_MAX30102
// #define SENSOR_TYPE_PULSE_ANALOG

// Adjust settings
#define BPM_UPDATE_INTERVAL 1000  // Update frequency (ms)
#define PULSE_THRESHOLD 550       // For analog sensor
#define MIN_BPM 30
#define MAX_BPM 250
```

## Protocol

**Format**: Text over serial at 9600 baud

```
72
73
74
```

- One BPM per line, updates every 1s, range 30-250

## Troubleshooting

| Issue                     | Solution                                         |
| ------------------------- | ------------------------------------------------ |
| Sensor not found          | Check wiring, verify I2C address (0x57)          |
| No BPM reading            | Wait 10s, don't press hard, try different finger |
| Can't connect in web      | Close Serial Monitor (can't share port)          |
| Erratic readings          | Keep still, shield from light, check connections |
| Permission denied (Linux) | `sudo usermod -a -G dialout $USER`               |

## Examples

Test sketches in `examples/`:

- `max30102-test/` - Sensor connectivity test
- `simple-pulse-sensor/` - Analog sensor test

## Resources

- **Library**: [SparkFun MAX3010x](https://github.com/sparkfun/SparkFun_MAX3010x_Sensor_Library)
- **Datasheet**: [MAX30102](https://datasheets.maximintegrated.com/en/ds/MAX30102.pdf)
- **Hardware Guide**: [HARDWARE.md](./HARDWARE.md)

⚠️ **Educational use only - not a medical device**

MIT License - See LICENSE file

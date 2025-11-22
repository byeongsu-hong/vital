# 5-Minute Quick Start

## What You Need

- Arduino Uno + MAX30102 sensor (~$10 total)
- USB cable + 4 jumper wires

## Setup

**1. Wire it** (1 min)

```
MAX30102 → Arduino
VIN → 5V   GND → GND   SDA → A4   SCL → A5
```

**2. Install Arduino IDE** (2 min)  
https://www.arduino.cc/en/software

**3. Install library** (1 min)  
Tools → Manage Libraries → Search "SparkFun MAX3010x" → Install

**4. Upload code** (1 min)

- File → Open → `vital-sense-sensor.ino`
- Tools → Board → Arduino Uno
- Tools → Port → (select your port)
- Click Upload (→)

**5. Test** (30 sec)

- Tools → Serial Monitor (9600 baud)
- Place finger on sensor
- Wait 10 seconds → see BPM numbers

🎉 **Done!**

## Connect to Web App

1. Close Serial Monitor
2. In web app: Select "Arduino USB" → Connect
3. Choose port → Start monitoring

## Troubleshooting

| Problem                  | Fix                                |
| ------------------------ | ---------------------------------- |
| Sensor not found         | Check wiring                       |
| No BPM                   | Wait longer, don't press hard      |
| Can't connect            | Close Serial Monitor               |
| Permission error (Linux) | `sudo usermod -a -G dialout $USER` |

See [README.md](./README.md) for details.

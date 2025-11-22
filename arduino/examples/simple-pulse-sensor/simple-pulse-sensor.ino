/**
 * Simple Pulse Sensor Example
 * 
 * Minimal example for analog pulse sensor testing
 * No external libraries required
 */

const int PULSE_PIN = A0;
const int LED_PIN = 13;
int threshold = 550;

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  Serial.println("Simple Pulse Sensor Ready");
}

void loop() {
  int signal = analogRead(PULSE_PIN);
  
  // Flash LED on pulse
  if (signal > threshold) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  
  // Send raw signal for visualization/calibration
  Serial.println(signal);
  
  delay(20);
}


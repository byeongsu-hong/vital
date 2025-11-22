import type { HeartRateAdapter } from "./heart-rate-types"

export class WebSerialAdapter implements HeartRateAdapter {
  id = "web-serial"
  name = "Arduino USB"
  private listeners: ((bpm: number) => void)[] = []
  private port: SerialPort | null = null
  private reader: ReadableStreamDefaultReader | null = null
  private keepReading = false
  private inputBuffer = ""

  async connect() {
    // Safe check for navigator.serial
    if (typeof navigator === "undefined" || !navigator.serial) {
      throw new Error("Web Serial API not supported in this browser.")
    }

    try {
      // Request a port and open a connection.
      this.port = await navigator.serial.requestPort()
      await this.port.open({ baudRate: 9600 })

      this.keepReading = true
      this.readLoop()
    } catch (error) {
      console.error("Error connecting to serial port:", error)
      throw error
    }
  }

  async disconnect() {
    this.keepReading = false
    if (this.reader) {
      try {
        await this.reader.cancel()
      } catch (e) {
        console.error("Error cancelling reader:", e)
      }
    }
    if (this.port) {
      try {
        await this.port.close()
      } catch (e) {
        console.error("Error closing port:", e)
      }
      this.port = null
    }
    this.listeners = []
  }

  onReading(callback: (bpm: number) => void) {
    this.listeners.push(callback)
  }

  private async readLoop() {
    if (!this.port?.readable) return

    const textDecoder = new TextDecoderStream()
    const readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable)
    const reader = textDecoder.readable.getReader()
    this.reader = reader

    try {
      while (this.keepReading) {
        const { value, done } = await reader.read()
        if (done) {
          break
        }
        if (value) {
          this.handleData(value)
        }
      }
    } catch (error) {
      console.error("Serial read error:", error)
    } finally {
      reader.releaseLock()
    }
  }

  private handleData(data: string) {
    // Append new data to buffer
    this.inputBuffer += data

    // Process complete lines
    const lines = this.inputBuffer.split("\n")

    // Keep the last partial line in the buffer
    this.inputBuffer = lines.pop() || ""

    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed.length > 0) {
        // Try to parse a number from the line
        // This regex looks for the first sequence of digits
        const match = trimmed.match(/(\d+)/)
        if (match) {
          const val = Number.parseInt(match[1], 10)
          // Basic validation for heart rate range
          if (!isNaN(val) && val > 30 && val < 250) {
            this.emit(val)
          }
        }
      }
    }
  }

  private emit(bpm: number) {
    this.listeners.forEach((listener) => listener(bpm))
  }
}

// Add type definition for Web Serial API if not present
interface SerialPort {
  open(options: { baudRate: number }): Promise<void>
  close(): Promise<void>
  readable: ReadableStream
}

// Extend Navigator interface
declare global {
  interface Navigator {
    serial: {
      requestPort(): Promise<SerialPort>
    }
  }
}

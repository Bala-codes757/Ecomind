// EcoMind IoT Stream Simulator Engine
import db from '../config/db.js';

class IoTSimulator {
  constructor() {
    this.devices = [
      { device_code: 'meter-001', metric: 'electricity', unit: 'kWh', base: 45.2, variance: 8.5 },
      { device_code: 'meter-002', metric: 'water', unit: 'litres', base: 280.0, variance: 35.0 },
      { device_code: 'meter-003', metric: 'waste', unit: 'kg', base: 12.5, variance: 3.0 }
    ];
  }

  /**
   * Generate next simulated normalized telemetry reading
   */
  generateNextReadings() {
    const readings = [];
    const now = new Date().toISOString();

    for (const dev of this.devices) {
      const randomNoise = (Math.random() * 2 - 1) * dev.variance;
      const value = parseFloat((dev.base + randomNoise).toFixed(2));

      const record = db.insert('iot_readings', {
        device_code: dev.device_code,
        metric: dev.metric,
        value,
        unit: dev.unit,
        timestamp: now
      });

      readings.push(record);
    }

    return readings;
  }

  /**
   * Fetch latest normalized readings across all meters
   */
  getLatestReadings() {
    const all = db.get('iot_readings');
    if (all.length === 0) {
      return this.generateNextReadings();
    }
    return all.slice(-10).reverse();
  }
}

export const iotSimulator = new IoTSimulator();
export default iotSimulator;

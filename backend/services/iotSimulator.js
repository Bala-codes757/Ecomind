// EcoMind IoT Stream Simulator Engine
import db from '../config/db.js';

class IoTSimulator {
  constructor() {
    this.refreshDevices();
  }

  refreshDevices() {
    const dbDevices = db.get('iot_devices');
    if (dbDevices && dbDevices.length > 0) {
      this.devices = dbDevices;
    } else {
      this.devices = [
        { device_code: '480V_SUBSTATION_MAIN', metric: 'electricity', unit: 'kW', base: 284.5, variance: 18.0 },
        { device_code: 'CHILLER_DELTA_T', metric: 'chw_delta_t', unit: '°F', base: 5.8, variance: 0.6 },
        { device_code: 'COMPRESSED_AIR_SCFM', metric: 'compressed_air_flow', unit: 'SCFM', base: 420.0, variance: 45.0 },
        { device_code: 'COOLING_TOWER_COC', metric: 'water_coc', unit: 'CoC', base: 3.2, variance: 0.2 },
        { device_code: 'SOLAR_INVERTER_KWP', metric: 'solar_power', unit: 'kW', base: 98.4, variance: 12.0 },
        { device_code: 'WASTE_COMPACTOR_LOAD', metric: 'waste_load', unit: 'kg', base: 240.0, variance: 30.0 }
      ];
    }
  }

  /**
   * Generate next simulated normalized telemetry reading
   */
  generateNextReadings() {
    this.refreshDevices();
    const readings = [];
    const now = new Date().toISOString();

    for (const dev of this.devices) {
      const base = dev.base || 100;
      const variance = dev.variance || 10;
      const randomNoise = (Math.random() * 2 - 1) * variance;
      const value = parseFloat((base + randomNoise).toFixed(2));

      const record = db.insert('iot_readings', {
        device_code: dev.device_code,
        meter_name: dev.meter_name || dev.device_code,
        metric: dev.metric,
        value,
        unit: dev.unit,
        status: dev.status || 'online',
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
    return all.slice(-12).reverse();
  }
}

export const iotSimulator = new IoTSimulator();
export default iotSimulator;


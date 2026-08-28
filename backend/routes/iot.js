import express from 'express';
import db from '../config/db.js';
import iotSimulator from '../services/iotSimulator.js';

const router = express.Router();

// 1. Get IoT Devices
router.get('/devices', (req, res, next) => {
  try {
    res.json({
      success: true,
      devices: db.get('iot_devices')
    });
  } catch (err) {
    next(err);
  }
});

// 2. Fetch Latest IoT Normalized Telemetry Stream
router.get('/readings', (req, res, next) => {
  try {
    const readings = iotSimulator.getLatestReadings();
    res.json({
      success: true,
      readings
    });
  } catch (err) {
    next(err);
  }
});

// 3. Trigger Simulated Pulse
router.post('/simulate', (req, res, next) => {
  try {
    const newReadings = iotSimulator.generateNextReadings();
    res.json({
      success: true,
      readings: newReadings,
      message: 'Simulated IoT telemetry generated'
    });
  } catch (err) {
    next(err);
  }
});

export default router;

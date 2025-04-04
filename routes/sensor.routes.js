const express = require('express');
const router = express.Router();
const Sensor = require('../models/sensor.model');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

// Get all sensors (Admin/Officer only)
router.get('/', authMiddleware, roleMiddleware(['admin', 'officer']), async (req, res) => {
  try {
    const sensors = await Sensor.find();
    res.send(sensors);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Get sensor by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id);
    if (!sensor) {
      return res.status(404).send({ error: 'Sensor not found' });
    }
    res.send(sensor);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// Create new sensor (Admin only)
router.post('/', authMiddleware, roleMiddleware(['admin']), async (req, res) => {
  try {
    const sensor = new Sensor(req.body);
    await sensor.save();
    res.status(201).send(sensor);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Update sensor data (Admin/Officer only)
router.patch('/:id', authMiddleware, roleMiddleware(['admin', 'officer']), async (req, res) => {
  try {
    const sensor = await Sensor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!sensor) {
      return res.status(404).send({ error: 'Sensor not found' });
    }
    res.send(sensor);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get sensors within geographic area
router.post('/nearby', authMiddleware, async (req, res) => {
  try {
    const { longitude, latitude, maxDistance } = req.body;
    const sensors = await Sensor.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude]
          },
          $maxDistance: maxDistance || 1000 // Default 1km radius
        }
      }
    });
    res.send(sensors);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

module.exports = router;
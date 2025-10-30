const express = require('express');
const router = express.Router();
const { fetchWeatherByCityName } = require('../utils/openweather');

router.get('/:city', async (req, res) => {
  try {
    const data = await fetchWeatherByCityName(req.params.city);
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;

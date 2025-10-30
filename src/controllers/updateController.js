const City = require('../models/City');
const { fetchWeatherByCityName } = require('../utils/openweather');

exports.updateAll = async (req, res) => {
  try {
    const cities = await City.find({ ownerId: req.user.userId });
    const results = [];
    for (const c of cities) {
      try {
        const data = await fetchWeatherByCityName(c.name, c.units || process.env.DEFAULT_UNITS || 'metric');
        const weather = {
          temp: data.main?.temp,
          condition: data.weather?.[0]?.main,
          description: data.weather?.[0]?.description,
          icon: data.weather?.[0]?.icon,
          humidity: data.main?.humidity,
          windSpeed: data.wind?.speed,
          sunrise: data.sys?.sunrise,
          sunset: data.sys?.sunset,
          raw: data
        };
        c.weather = weather;
        c.updatedAt = new Date();
        await c.save();
        results.push({ city: c.name, status: 'updated' });
      } catch (e) {
        results.push({ city: c.name, status: 'error', error: e.message });
      }
    }
    return res.json({ results });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// backend/src/controllers/cityController.js
const City = require('../models/City');
const { fetchWeatherByCityName, fetch5DayForecast_OpenWeather, geocodeOpenWeather } = require('../utils/openweather');
const { fetch5DayForecast_OpenMeteo } = require('../utils/open_meteo');


exports.getCities = async (req, res) => {
  try {
    const cities = await City.find({ ownerId: req.user.userId }).lean();
    return res.json(cities);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.getCityById = async (req, res) => {
  const id = req.params.id;
  const city = await City.findOne({ _id: id, ownerId: req.user.userId }).lean();
  if (!city) return res.status(404).json({ error: 'City not found' });

  const units = city.units || 'metric';

  try {
    // try Open-Meteo (need lat/lon)
    let lat = city.lat, lon = city.lon;
    if (!lat || !lon) {
      // try geocoding via OpenWeather
      const geo = await geocodeOpenWeather(city.name, 1);
      if (geo && geo.length > 0) {
        lat = geo[0].lat; lon = geo[0].lon;
      }
    }

    if (lat && lon) {
      const meteo = await fetch5DayForecast_OpenMeteo(lat, lon, 'auto');
      // prepare daily array of first 5 days
      const daily = meteo.daily;
      const days = daily.time.slice(0,5).map((d, idx) => ({
        date: d,
        temp_max: daily.temperature_2m_max[idx],
        temp_min: daily.temperature_2m_min[idx],
        sunrise: daily.sunrise[idx],
        sunset: daily.sunset[idx],
        weathercode: daily.weathercode[idx]
      }));
      return res.json({ city, forecast: { source: 'open-meteo', daily, days } });
    } else {
      // fallback to OpenWeather 3-hour
      const forecastRaw = await fetch5DayForecast_OpenWeather(city.name, units);
      // group into daily map -> daily summary
      const list = forecastRaw.list || [];
      const buckets = {};
      for (const item of list) {
        const date = new Date(item.dt*1000).toISOString().slice(0,10);
        buckets[date] = buckets[date] || [];
        buckets[date].push(item);
      }
      const days = Object.keys(buckets).slice(0,5).map(date => {
        const items = buckets[date];
        const temps = items.map(i => i.main.temp);
        const min = Math.min(...temps), max = Math.max(...temps);
        return { date, temp_min: min, temp_max: max, entries: items };
      });
      return res.json({ city, forecast: { source: 'open-weather', list, days } });
    }
  } catch (err) {
    return res.json({ city, forecast: { error: err.message }});
  }
};

exports.addCity = async (req, res) => {
  try {
    let { name } = req.body;
    if (!name) return res.status(400).json({ error: 'City name required' });
    name = name.trim();
    const exists = await City.findOne({ ownerId: req.user.userId, name: new RegExp(`^${name}$`, 'i') });
    if (exists) return res.status(409).json({ error: 'City already tracked', city: exists });
    const weather = await fetchWeatherByCityName(name, process.env.DEFAULT_UNITS || 'metric');
    const doc = {
      ownerId: req.user.userId,
      name: weather.name,
      weather: {
        temp: weather.main?.temp,
        condition: weather.weather?.[0]?.main,
        description: weather.weather?.[0]?.description,
        icon: weather.weather?.[0]?.icon,
        humidity: weather.main?.humidity,
        windSpeed: weather.wind?.speed,
        sunrise: weather.sys?.sunrise,
        sunset: weather.sys?.sunset,
        raw: weather
      }
    };
    const city = await City.create(doc);
    return res.json(city);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.deleteCity = async (req, res) => {
  try {
    const id = req.params.id;
    const result = await City.deleteOne({ _id: id, ownerId: req.user.userId });
    if (result.deletedCount === 0) return res.status(404).json({ error: 'Not found or not permitted' });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

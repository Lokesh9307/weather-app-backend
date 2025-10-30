// backend/src/utils/openweather.js
const axios = require('axios');
const API_KEY = process.env.OPENWEATHER_API_KEY;
if (!API_KEY) throw new Error('OPENWEATHER_API_KEY required');

async function fetchWeatherByCityName(city, units = 'metric') {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${units}&appid=${API_KEY}`;
  const res = await axios.get(url);
  return res.data;
}

async function fetch5DayForecast_OpenWeather(city, units = 'metric') {
  // returns forecastRaw (has .list of 3-hour entries and .city)
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=${units}&appid=${API_KEY}`;
  const res = await axios.get(url);
  return res.data;
}

// optional: geocode using OpenWeather (to get lat/lon for other APIs)
async function geocodeOpenWeather(city, limit = 1) {
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=${limit}&appid=${API_KEY}`;
  const res = await axios.get(url);
  return res.data; // array of places with lat, lon
}

module.exports = {
  fetchWeatherByCityName,
  fetch5DayForecast_OpenWeather,
  geocodeOpenWeather
};

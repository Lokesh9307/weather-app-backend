// backend/src/utils/open_meteo.js
const axios = require('axios');
async function fetch5DayForecast_OpenMeteo(lat, lon, timezone = 'auto') {
  // request 7 days to be safe, then slice first 5
  const dailyParams = [
    'temperature_2m_max',
    'temperature_2m_min',
    'sunrise',
    'sunset',
    'weathercode'
  ].join(',');

  const hourlyParams = ['temperature_2m','apparent_temperature','precipitation','windspeed_10m'].join(',');

  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=${dailyParams}&hourly=${hourlyParams}&timezone=${encodeURIComponent(timezone)}&forecast_days=7`;

  const res = await axios.get(url);
  return res.data; // contains .daily and .hourly
}

module.exports = { fetch5DayForecast_OpenMeteo };

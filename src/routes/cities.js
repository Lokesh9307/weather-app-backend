// backend/src/routes/cities.js
const express = require('express');
const router = express.Router();
const city = require('../controllers/citiesController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// list all
router.get('/', city.getCities);

// get single city + 5-day forecast
router.get('/:id', city.getCityById);

// add city
router.post('/', city.addCity);

// delete city
router.delete('/:id', city.deleteCity);

module.exports = router;

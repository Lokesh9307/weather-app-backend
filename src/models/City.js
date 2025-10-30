const mongoose = require('mongoose');

const CitySchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  units: { type: String, default: 'metric' },
  weather: { type: mongoose.Schema.Types.Mixed }
});

// optional index to prevent duplicates per user
CitySchema.index({ ownerId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('City', CitySchema);

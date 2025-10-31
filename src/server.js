require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const cityRoutes = require('./routes/cities');
const weatherRoutes = require('./routes/weather');
const updateController = require('./controllers/updateController');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());

// CORS: allow frontend origin and credentials
const allowedOrigins = [
  "https://forecast-flow-one.vercel.app", // Production
  "http://localhost:3000", // Development
];

// Dynamically allow origins
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/weather', weatherRoutes);
// update-all is protected route that updates the current user's cities
const authMiddleware = require('./middleware/authMiddleware');
app.patch('/api/update-all', authMiddleware, updateController.updateAll);

async function start() {
    console.log('Connecting to MongoDB...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

start().catch(err => { console.error(err); process.exit(1); });

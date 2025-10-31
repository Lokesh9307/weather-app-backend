Each README includes:
📘 Overview
⚙️ Tech Stack
📁 Folder Structure
🧩 Setup Instructions
🔐 Environment Variables
🚀 Deployment Steps
🧪 API Testing (Postman & curl)
💡 Troubleshooting
🌟 Features

Forecast Flow – Backend
Tech: Node.js, Express, MongoDB, JWT, OpenWeatherMap API

📘 Overview

The Forecast Flow Backend is a secure REST API server that powers the Forecast Flow Weather App.
It handles user authentication, session management, and real-time weather + 5-day forecast data fetching using the OpenWeatherMap API.

⚙️ Tech Stack
Node.js (Express.js) – Backend framework
MongoDB (Mongoose) – Database for users
JWT – Token-based authentication
bcrypt.js – Password hashing
cookie-parser – Secure HttpOnly cookies
CORS – Cross-origin configuration
OpenWeatherMap API – Weather data provider

🧩 Installation & Setup
🖥 Local Setup
# 1. Clone the repo
git clone https://github.com/Lokesh9307/forecast-flow-backend.git
cd forecast-flow-backend

# 2. Install dependencies
npm install

# 3. Create a .env file in the root (see below)

# 4. Run the server
npm run start

🔐 Environment Variables
Create a .env file in the backend root:
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/weather
JWT_SECRET=supersecretkey
JWT_EXPIRES_IN=3600
OPENWEATHER_API_KEY=your_openweather_api_key
FRONTEND_URL=http://localhost:3000
COOKIE_DOMAIN=localhost


 🚀 Deployment
🟣 Render (recommended)
Push code to GitHub.
Create a Web Service on Render → Connect your repo.
Add all .env variables under Environment tab.
Set Start Command to:
node src/server.js
Deploy!

🧠 API Endpoints
🔐 Auth Routes
Method	Endpoint	Description
POST	/api/auth/signup	Register new user
POST	/api/auth/login	Login user & set HttpOnly cookie
POST	/api/auth/logout	Clear token cookie
GET	/api/auth/me	Get current user (from cookie)
🌦 Weather Routes
Method	Endpoint	Description
GET	/api/weather/:city	Get current weather
GET	/api/weather/:city/forecast	Get 5-day forecast

{
  "city": "London",
  "forecast": [
    { "date": "2025-10-31", "temp": 21, "description": "clear sky" },
    { "date": "2025-11-01", "temp": 22, "description": "light rain" }
  ]
}

🌟 Key Features:-
🔒 Secure JWT Authentication
🌦 Live weather & 5-day forecast
☁️ MongoDB integration
⚙️ RESTful architecture
🚀 Ready for Render deployment


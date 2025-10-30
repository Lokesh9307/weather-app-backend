// backend/src/controllers/authController.js

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN || 3600); // seconds

if (!JWT_SECRET) throw new Error('JWT_SECRET required');

const isProd = process.env.NODE_ENV === 'production';

/**
 * Create a signed JWT token
 * payload should be an object (e.g. { userId, email })
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Build cookie options consistently
 * - sameSite: 'none' and secure: true are required for cross-site cookies in modern browsers.
 * - domain is set only if COOKIE_DOMAIN provided and not 'localhost'
 */
function makeCookieOptions() {
  const opts = {
    httpOnly: true,
    secure: isProd,         // true in production (HTTPS)
    sameSite: 'none',       // allow cross-site cookie (required for cross-origin)
    maxAge: JWT_EXPIRES_IN * 1000,
    path: '/'
  };

  // Only set domain if explicitly configured and not localhost
  const cd = process.env.COOKIE_DOMAIN;
  if (cd && cd !== 'localhost') {
    opts.domain = cd;
  }

  return opts;
}

/**
 * Signup - create user, set token cookie, return user info (no password)
 * Body: { email, password }
 */
exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email: email.toLowerCase(), password: hashed });

    const token = signToken({ userId: user._id.toString(), email: user.email });
    res.cookie('token', token, makeCookieOptions());

    return res.json({ user: { _id: user._id, email: user.email } });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

/**
 * Login - authenticate, set token cookie, return user info
 * Body: { email, password }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ userId: user._id.toString(), email: user.email });
    res.cookie('token', token, makeCookieOptions());

    return res.json({ user: { _id: user._id, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

/**
 * Logout - clear cookie
 */
exports.logout = async (req, res) => {
  try {
    // Clear the cookie using same options (host/domain and path must match)
    res.cookie('token', '', { ...makeCookieOptions(), maxAge: 0 });
    return res.json({ success: true });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
};

/**
 * Me - return current user info if cookie valid, else { user: null }
 * GET /api/auth/me
 */
exports.me = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.json({ user: null });

    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({ user: { userId: payload.userId, email: payload.email } });
  } catch (err) {
    // token invalid / expired or other error
    return res.json({ user: null });
  }
};

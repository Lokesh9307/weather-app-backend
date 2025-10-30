const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = Number(process.env.JWT_EXPIRES_IN || 3600);
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || 'localhost';

if (!JWT_SECRET) throw new Error('JWT_SECRET required');

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email: email.toLowerCase(), password: hashed });
    const token = signToken({ userId: user._id.toString(), email: user.email });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: JWT_EXPIRES_IN * 1000,
      sameSite: 'lax',
      domain: COOKIE_DOMAIN,
      path: '/'
    });
    return res.json({ user: { _id: user._id, email: user.email } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email & password required' });
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ userId: user._id.toString(), email: user.email });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: JWT_EXPIRES_IN * 1000,
      sameSite: 'lax',
      domain: COOKIE_DOMAIN,
      path: '/'
    });
    return res.json({ user: { _id: user._id, email: user.email } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  res.cookie('token', 'deleted', { httpOnly: true, maxAge: 0, path: '/', domain: COOKIE_DOMAIN });
  return res.json({ success: true });
};

exports.me = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.json({ user: null });
    const payload = jwt.verify(token, JWT_SECRET);
    return res.json({ user: { userId: payload.userId, email: payload.email } });
  } catch {
    return res.json({ user: null });
  }
};

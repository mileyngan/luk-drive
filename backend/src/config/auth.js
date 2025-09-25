const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '24h' });
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  comparePassword
};
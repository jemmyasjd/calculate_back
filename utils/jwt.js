require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken
};
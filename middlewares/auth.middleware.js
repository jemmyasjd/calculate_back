const { verifyToken } = require('../utils/jwt.js');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    req.user = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

module.exports = authMiddleware;
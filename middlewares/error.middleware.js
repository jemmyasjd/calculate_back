const { ZodError } = require('zod');

const errorHandler = (err, req, res) => {
  console.error(err.stack);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }

  if (err.message === 'Invalid credentials') {
    return res.status(401).json({
      success: false,
      message: err.message
    });
  }

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
};

module.exports = errorHandler;
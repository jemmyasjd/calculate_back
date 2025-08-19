const asyncHandler = require('express-async-handler');
const authService = require('../services/auth.service');
const { signUpSchema, signInSchema } = require('../validations/auth.validation');

class AuthController {
  signUp = asyncHandler(async (req, res) => {
    try {
      const validatedData = signUpSchema.parse(req.body);

      const result = await authService.signUp(
        validatedData.name,
        validatedData.email,
        validatedData.password
      );

      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Something went wrong',
        data: null
      });
    }
  });

  signIn = asyncHandler(async (req, res) => {
    try {
      const validatedData = signInSchema.parse(req.body);

      const result = await authService.signIn(
        validatedData.email,
        validatedData.password
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result
      });
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Something went wrong',
        data: null
      });
    }
  });
}

module.exports = new AuthController();

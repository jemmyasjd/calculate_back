const { z } = require('zod');

const signUpSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .trim(),
  email: z.string()
    .email('Invalid email format')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
});

const signInSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .trim()
    .toLowerCase(),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
});

module.exports = {
  signUpSchema,
  signInSchema
};

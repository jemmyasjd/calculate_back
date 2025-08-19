const bcrypt = require('bcryptjs');
const User = require('../models/user.model'); 
const { generateToken } = require('../utils/jwt');

class AuthService {
  async signUp(name, email, password) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already in use');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      passwordHash
    });

    const payload = {
      userid: newUser._id,
      name: newUser.name,
      email: newUser.email
    };

    const token = generateToken(payload);

    return {
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    };
  }

  async signIn(email, password) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      userid: user._id,
      name: user.name,
      email: user.email
    };

    const token = generateToken(payload);

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    };
  }
}

module.exports = new AuthService();

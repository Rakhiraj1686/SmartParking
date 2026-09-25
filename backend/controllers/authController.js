const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

function signToken(user) {
  // Payload shape is part of the contract with the frontend: { userId, role }
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    // Deliberately do NOT destructure `role` from req.body — public
    // registration must never be able to self-assign a role. Every new
    // account is created as 'user'; only an existing admin can promote
    // someone via PATCH /api/admin/users/:id/role.
    const { name, email, password, phone, vehicleNumber, vehicleType } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, password, phone, vehicleNumber, vehicleType, role: 'user' });
    const token = signToken(user);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: { user: user.toSafeObject(), token },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user: user.toSafeObject(), token },
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    res.status(200).json({ success: true, message: 'Current user', data: { user: req.user.toSafeObject() } });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };

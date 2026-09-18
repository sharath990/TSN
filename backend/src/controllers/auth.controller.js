const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const config = require('../config');
const { User } = require('../models');
const { ROLES } = require('../config/constants');
const { sendSuccess, sendError } = require('../utils/response');
const { verifyFirebaseToken } = require('../services/firebase');
const emailService = require('../services/email');

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
};

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const existingUser = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return sendError(res, 400, 'Email already registered');
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      phone,
      password,
      role: ROLES.CUSTOMER,
    });

    const token = generateToken(user.id);

    sendSuccess(res, 201, 'Registration successful', {
      user,
      token,
    });

    emailService.sendWelcome(user).catch(console.error);
    emailService.sendAdminNewCustomer(user).catch(console.error);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password');
    }

    const user = await User.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return sendError(res, 401, 'Invalid credentials');
    }

    if (user.provider === 'google') {
      return sendError(res, 400, 'Please sign in with Google');
    }

    if (user.status === 'inactive') {
      return sendError(res, 403, 'Account has been deactivated');
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return sendError(res, 401, 'Invalid credentials');
    }

    const token = generateToken(user.id);

    sendSuccess(res, 200, 'Login successful', {
      user,
      token,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return sendError(res, 400, 'Google credential is required');
    }

    const googleUser = await verifyFirebaseToken(credential);

    let user = await User.findOne({
      where: {
        [Op.or]: [
          { email: googleUser.email.toLowerCase() },
          { googleId: googleUser.uid },
        ],
      },
    });

    if (user) {
      const updates = {};
      if (!user.googleId) {
        updates.googleId = googleUser.uid;
        updates.provider = 'google';
        updates.password = null;
      }
      if (Object.keys(updates).length > 0) {
        await user.update(updates);
      }
    } else {
      const isNewUser = true;
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.uid,
        provider: 'google',
        role: ROLES.CUSTOMER,
      });
      if (isNewUser) {
        emailService.sendWelcome(user).catch(console.error);
        emailService.sendAdminNewCustomer(user).catch(console.error);
      }
    }

    if (user.status === 'inactive') {
      return sendError(res, 403, 'Account has been deactivated');
    }

    const token = generateToken(user.id);

    sendSuccess(res, 200, 'Google login successful', {
      user,
      token,
    });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.logout = async (_req, res) => {
  sendSuccess(res, 200, 'Logged out successfully');
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    sendSuccess(res, 200, 'Profile retrieved', { user });
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    const user = await User.findByPk(req.user.id);

    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({
        where: { email: email.toLowerCase(), id: { [Op.ne]: user.id } },
      });
      if (emailExists) {
        return sendError(res, 400, 'Email already in use');
      }
    }

    await user.update({ name, email: email?.toLowerCase(), phone, address });
    sendSuccess(res, 200, 'Profile updated', { user });
    emailService.sendProfileUpdated(user).catch(console.error);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (user.provider === 'google') {
      return sendError(res, 400, 'Password management is not available for Google accounts');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 400, 'Current password is incorrect');
    }

    await user.update({ password: newPassword });
    sendSuccess(res, 200, 'Password changed successfully');
    emailService.sendPasswordChanged(user).catch(console.error);
  } catch (error) {
    sendError(res, 500, error.message);
  }
};

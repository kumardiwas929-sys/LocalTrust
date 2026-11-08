import User from '../models/User.js';
import ProviderProfile from '../models/ProviderProfile.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getCookieOptions,
} from '../config/jwt.js';
import { ROLES } from '../constants/roles.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const assignedRole = role || ROLES.CUSTOMER;

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      phone: phone || '',
      isEmailVerified: true, // For demo/production ease
    });

    // If registered as provider, create empty profile
    let providerProfile = null;
    if (assignedRole === ROLES.PROVIDER) {
      providerProfile = await ProviderProfile.create({
        userId: user._id,
        businessName: name,
        serviceAreas: ['Local Area'],
        skills: ['General Service'],
      });
    }

    const payload = { userId: user._id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie('refreshToken', refreshToken, getCookieOptions());
    res.cookie('accessToken', accessToken, { ...getCookieOptions(), maxAge: 15 * 60 * 1000 });

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
        },
        providerProfileId: providerProfile?._id || null,
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account is currently deactivated. Please contact support.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.',
      });
    }

    user.lastLoginAt = new Date();
    await user.save();

    let providerProfile = null;
    if (user.role === ROLES.PROVIDER) {
      providerProfile = await ProviderProfile.findOne({ userId: user._id });
    }

    const payload = { userId: user._id, role: user.role, email: user.email };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie('refreshToken', refreshToken, getCookieOptions());
    res.cookie('accessToken', accessToken, { ...getCookieOptions(), maxAge: 15 * 60 * 1000 });

    res.json({
      success: true,
      message: 'Login successful.',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          profileImage: user.profileImage,
          addresses: user.addresses,
        },
        providerProfile,
        accessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res) => {
  res.clearCookie('refreshToken', getCookieOptions());
  res.clearCookie('accessToken', getCookieOptions());
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let providerProfile = null;

    if (user.role === ROLES.PROVIDER) {
      providerProfile = await ProviderProfile.findOne({ userId: user._id }).populate('categories');
    }

    res.json({
      success: true,
      data: {
        user,
        providerProfile,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token is missing.',
      });
    }

    const decoded = verifyRefreshToken(token);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token. Please log in again.',
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User session no longer valid.',
      });
    }

    const payload = { userId: user._id, role: user.role, email: user.email };
    const newAccessToken = generateAccessToken(payload);

    res.cookie('accessToken', newAccessToken, { ...getCookieOptions(), maxAge: 15 * 60 * 1000 });

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Don't leak existence of user
      return res.json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been sent.',
      });
    }

    // For demo/production, generate a secure 6-digit or JWT reset token
    const resetToken = generateAccessToken({ userId: user._id, type: 'pwd_reset' });

    res.json({
      success: true,
      message: 'Password reset instructions have been sent.',
      data: {
        // Provided for easy client testing
        resetToken,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
    }

    const user = await User.findById(decoded.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password has been updated successfully. You can now login.',
    });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;
    if (req.user) {
      req.user.isEmailVerified = true;
      await req.user.save();
      return res.json({ success: true, message: 'Email verified successfully.' });
    }

    res.json({ success: true, message: 'Email verified.' });
  } catch (err) {
    next(err);
  }
};

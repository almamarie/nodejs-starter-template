const { Op } = require('sequelize');
const multer = require('multer');
const crypto = require('crypto');
const User = require('../models/user.model');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const logger = require('../logs/logger');
const Config = require('../utils/config');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const sendEmail = require('../utils/email');
const fs = require('fs');
const os = require('os');
const { deleteFile } = require('../utils/deleteFile');
const CustomCloudinary = require('../databases/cloudinary');
const { roles, permissions } = require('../utils/roles-permissions');
const config = new Config();

// =================================================================================

const cloudinary = new CustomCloudinary();

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/public/img/new-user');
  },

  filename: (req, file, cb) => {
    const ext = file.mimetype.split('/')[1];
    const id = req.body.email
      ? req.body.email.split('@')[0]
      : req.params.userId;
    cb(null, `user-${id}-${Date.now()}.${ext}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadPhoto = upload.single('profilePicture');

// =================================================================================

comparePasswords = async (plainTextPassword, hashedPassword) => {
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

generateJwt = async (userId, role) => {
  const duration = 60 * 60 * config.jwt.duration;

  const payloadData = {
    sub: userId,
    iss: 'https://sellz-backend.com',
    aud: 'https://sellz.com',
    exp: Math.floor(Date.now() / 1000) + duration,
    iat: Math.floor(Date.now() / 1000),
    role: role,
  };

  return jwt.sign(payloadData, config.jwt.secret);
};

const createSendToken = async (user, statusCode, res) => {
  const token = await generateJwt(user.userId, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + config.jwtCookieExpiresIn * 60 * 60 * 1000),
    httpOnly: true,
  };

  if ((process.env.NODE_ENV = 'production')) cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  return res.status(statusCode).send({
    status: 'success',
    token,
    data: {
      user: user.format(),
    },
  });
};

exports.signIn = catchAsync(async (req, res, next) => {
  logger.info('Signing user in...');
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return next(new AppError('User not found.', 400));
  }

  if (!(await comparePasswords(password, user.passwordHash))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  logger.info('User signed in successfully!');
  createSendToken(user, 201, res);
});

exports.signup = function (userRole) {
  return catchAsync(
    async (req, res, next) => {
      logger.info(`Creating a new ${userRole} user...`);

      if (!req.file) next(new AppError('Profile picture not found.', 400));

      const profilePicturePath = req.file.path;

      const identicalUser = await User.findAll({
        where: { email: req.body.email },
      });

      if (identicalUser.length > 1) throw new Error('User may already exists');

      if (req.body.password.length < 8)
        throw new Error('provided password is not strong');

      const passwordHash = await generateHashPassword(req.body.password);

      const profilePicture = await cloudinary.uploadSingleImage(
        profilePicturePath
      );
      const newUser = await User.create({
        ...req.body,
        role: userRole,
        passwordHash,
        profilePicture,
      });

      deleteFile(profilePicturePath);

      createSendToken(newUser, 201, res);
    },
    (req, res) => {
      const profilePicture = req.file.path;
      deleteFile(profilePicture);
    }
  );
};

generateHashPassword = async (password) => {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError('Please provide user email', 400));
  }
  const user = await User.findOne({ where: { email: req.body.email } });

  if (!user) {
    return next(new AppError('User not found!', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  if (!req.params.token) return next(new AppError('Token is required', 400));

  if (!req.body.password)
    return next(new AppError('New password is required', 400));

  const hashedToken = await crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { [Op.gt]: Date.now() },
    },
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  if (await comparePasswords(req.body.password, user.passwordHash)) {
    return next(
      new AppError('New password cannot be same as previous password', 401)
    );
  }

  await user.update({
    passwordHash: await this.generateHashPassword(req.body.password),
    passwordResetToken: undefined,
    passwordResetExpires: undefined,
    passwordChangedAt: Date.now(),
  });
  await user.save();

  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.body.userId);

  if (!user) return next(new AppError('User not found.', 400));

  if (!(await comparePasswords(req.body.currentPassword, user.passwordHash)))
    return next(new AppError('Your current password is wrong', 401));

  user.update({
    passwordHash: await this.generateHashPassword(req.body.newPassword),
    passwordChangedAt: Date.now(),
  });
  const updatedUser = await user.save();

  createSendToken(updatedUser, 201, res);
});

exports.requireAuth = (permission = []) => {
  return catchAsync(async (req, res, next) => {
    logger.info('Require auth called');

    if (permission[0] === '*') return next();

    if (!req.headers || !req.headers.authorization)
      return next(new AppError('No authorization headers.', 401));

    // console.log('here');
    const tokenBearer = req.headers.authorization.split(' ');
    if (tokenBearer.length !== 2) return new AppError('Malformed token.', 401);

    const token = tokenBearer[1];
    const jwtResponse = jwt.verify(token, config.jwt.secret);

    checkPermission(jwtResponse.role, permission, next);

    const currentUser = await User.findOne({
      where: { userId: jwtResponse.sub },
    });

    if (!currentUser) {
      return next(
        new AppError(
          'The user belonging to this token does no longer exist.',
          401
        )
      );
    }

    if (currentUser.changedPasswordAfter(jwtResponse.iat)) {
      return next(
        new AppError(
          'User recently changed password! Please log in again.',
          401
        )
      );
    }

    req.user = currentUser;

    logger.info('User Verified');
    return next();
  });
};

function checkPermission(payloadRole, permission, next) {
  if (permission === '*') return true;

  if (typeof permission === 'string') {
    permission = [permission];
  }

  if (!permission || permission.length < 1)
    next(new AppError('Permission not provided.', 500));

  const rolePermissions = permissions[payloadRole];

  for (let i = 0; i < permission.length; i++) {
    if (!rolePermissions.includes(permission[i]))
      next(new AppError('User not authorised to perform this action', 401));
  }
}

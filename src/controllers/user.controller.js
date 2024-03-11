const User = require('../models/user.model');
const logger = require('../logs/logger');
const multer = require('multer');
const { deleteFile } = require('../utils/deleteFile');
const catchAsync = require('../utils/catchAsync');
const CustomCloudinary = require('../databases/cloudinary');
const AppError = require('../utils/appError');

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

exports.postCreateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use /signup instead',
  });
};

exports.patchUpdateUser = catchAsync(async (req, res) => {
  logger.info('Update user called...');

  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId);
    if (!user) {
      new AppError('User may not exist', 404);
    }

    await user.update({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      otherNames: req.body.otherNames,
      birthdate: req.body.birthdate,
      address: req.body.address,
    });

    await user.save();

    return res.status(201).send({
      success: true,
      data: { user: user.format() },
    });
  } catch (error) {
    console.log(error);
    return res
      .status(400)
      .send({ success: false, body: 'Error updating user.' });
  }
});

exports.patchUpdateProfilePhoto = catchAsync(
  async (req, res) => {
    logger.info('Creating a new user...');
    const profilePicturePath = req.file.path;

    // try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId);
    if (!user) {
      new AppError('User may not exist', 404);
    }

    const profilePicture = await cloudinary.uploadSingleImage(
      profilePicturePath
    );

    await user.update({ profilePicture });
    await user.save();

    deleteFile(profilePicturePath);

    return res.status(201).send({
      success: true,
      data: { user: user.format() },
    });
  },
  (req, res) => {
    const profilePicture = req.file.path;
    deleteFile(profilePicture);
  }
);

exports.getUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findByPk(userId);

    if (!user) {
      new AppError('User may not exist', 404);
    }
    return res.status(200).send({
      success: true,
      data: { user: user.format() },
    });
  } catch (error) {
    return res.status(400).send({ success: false, body: 'User not found.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByPk(userId);
    if (!user) throw new Error();
    await user.destroy();
    return res.status(200).send({ success: true, data: 'User deleted.' });
  } catch (error) {
    res.status(400).send({ success: false, body: 'An error occured' });
  }
};

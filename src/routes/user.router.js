const express = require('express');
const userController = require('../controllers/user.controller');
const { requireAuth } = require('../controllers/auth.controller');
const router = express.Router();

// =================================== USER ROUTES ===================================
router.post('/', userController.postCreateUser);
router.patch(
  '/:userId/',
  requireAuth('patch:user-details'),
  userController.patchUpdateUser
);

router.patch(
  '/:userId/profile-picture/',
  requireAuth('patch:user-details'),
  userController.uploadPhoto,
  userController.patchUpdateProfilePhoto
);

// requireAuth('get:user-details'),

router.get('/:userId', userController.getUser);
router.delete(
  '/:userId',
  requireAuth('get:user-details'),
  userController.deleteUser
);

module.exports = router;

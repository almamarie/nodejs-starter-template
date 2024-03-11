const express = require('express');
const authController = require('../controllers/auth.controller');
const router = express.Router();

router.post('/signin', authController.signIn);

router.post(
  '/user/signup',
  authController.requireAuth(['*']),
  authController.uploadPhoto,
  authController.signup('user')
);

router.post(
  '/admin/signup',
  authController.requireAuth(['create:admin']),
  authController.uploadPhoto,
  authController.signup('admin')
);

// router.post(
//   '/superadmin/signup',
//   authController.uploadPhoto,
//   authController.signup('superadmin')
// );

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch(
  '/passwordUpdate',
  authController.requireAuth,
  authController.updatePassword
);

module.exports = router;

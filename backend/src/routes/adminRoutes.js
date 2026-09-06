const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const adminController = require('../controllers/adminController');
const validate = require('../middleware/validate');
const { authenticate, authorize } = require('../middleware/auth');
const {
  nameValidator,
  addressValidator,
  emailValidator,
  passwordValidator,
} = require('../utils/validators');

// every route in this file is admin-only
router.use(authenticate, authorize('admin'));

router.get('/dashboard', adminController.dashboard);

router.post(
  '/users',
  [
    nameValidator(),
    emailValidator(),
    addressValidator(),
    passwordValidator(),
    body('role').optional().isIn(['user', 'admin', 'store_owner']),
  ],
  validate,
  adminController.createUser
);

router.post(
  '/stores',
  [
    body('name').trim().notEmpty().withMessage('Store name is required'),
    emailValidator(),
    addressValidator(),
    body('ownerId').optional().isInt(),
  ],
  validate,
  adminController.createStore
);

router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserDetail);
router.get('/stores', adminController.listStores);
router.get('/store-owners', adminController.listStoreOwners);

module.exports = router;

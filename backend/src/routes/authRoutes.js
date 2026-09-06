const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  nameValidator,
  addressValidator,
  emailValidator,
  passwordValidator,
} = require('../utils/validators');

router.post(
  '/signup',
  [nameValidator(), emailValidator(), addressValidator(), passwordValidator()],
  validate,
  authController.signup
);

router.post('/login', [emailValidator(), body_password_required()], validate, authController.login);

router.get('/me', authenticate, authController.me);

router.put(
  '/password',
  authenticate,
  [passwordValidator('newPassword')],
  validate,
  authController.updatePassword
);

// small local helper so login only requires "password is present",
// not the full complexity rules (those only apply when *setting* a password)
function body_password_required() {
  const { body } = require('express-validator');
  return body('password').notEmpty().withMessage('Password is required');
}

module.exports = router;

const { body } = require('express-validator');

// Name: 20-60 characters
const nameValidator = (field = 'name') =>
  body(field)
    .trim()
    .isLength({ min: 20, max: 60 })
    .withMessage('Name must be between 20 and 60 characters');

// Address: max 400 characters
const addressValidator = (field = 'address') =>
  body(field)
    .trim()
    .isLength({ min: 1, max: 400 })
    .withMessage('Address must be at most 400 characters');

// Email: standard email format
const emailValidator = (field = 'email') =>
  body(field).trim().isEmail().withMessage('Must be a valid email address');

// Password: 8-16 chars, at least one uppercase letter and one special character
const passwordValidator = (field = 'password') =>
  body(field)
    .isLength({ min: 8, max: 16 })
    .withMessage('Password must be 8-16 characters long')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[!@#$%^&*(),.?":{}|<>_\-+=~`[\]\\/;']/)
    .withMessage('Password must contain at least one special character');

module.exports = {
  nameValidator,
  addressValidator,
  emailValidator,
  passwordValidator,
};

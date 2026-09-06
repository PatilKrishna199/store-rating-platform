const { validationResult } = require('express-validator');

// Runs after express-validator chains; returns a 400 with the first
// error message per field if any validation failed.
module.exports = function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

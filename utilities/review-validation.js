/* *************************
* Review Validation Middleware
***************************/
const { body } = require('express-validator');

exports.addReviewRules = [
  body('rating')
    .trim()
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ max: 2000 }).withMessage('Comment is too long')
];
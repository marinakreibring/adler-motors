/* *************************
*  Review routes
***************************/
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const reviewValidation = require('../utilities/review-validation');

// GET form to add review for vehicle
router.get('/add/:inv_id', reviewController.buildAddReviewForm);

// POST add review
router.post('/add', reviewValidation.addReviewRules, reviewController.postAddReview);

module.exports = router;
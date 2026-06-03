/* *************************
* Review enhancement
***************************/
const reviewModel = require('../models/review-model');
const { validationResult } = require('express-validator');
const utilities = require('../utilities');

exports.buildAddReviewForm = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id, 10);
    const vehicle = await require('../models/inventory-model').getVehicleById(inv_id);
    if (!vehicle) return next({ status: 404, message: 'Vehicle not found' });
    const nav = await utilities.getNav();
    res.render('reviews/add-review', {
      title: `Add Review for ${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle,
    });
  } catch (err) {
    next(err);
  }
};

exports.postAddReview = async function (req, res, next) {
  try {
    const errors = validationResult(req);
    const { vehicle_id, rating, comment } = req.body;
    if (!res.locals.accountData) {
      req.flash('error', 'You must be logged in to leave a review.');
      return res.redirect(`/inv/detail/${vehicle_id}`);
    }
    if (!errors.isEmpty()) {
      errors.array().forEach(e => req.flash('error', e.msg));
      return res.redirect(`/reviews/add/${vehicle_id}`);
    }

    await reviewModel.addReview({
      vehicle_id: parseInt(vehicle_id, 10),
      client_id: res.locals.accountData.account_id,
      rating: parseInt(rating, 10),
      comment: comment || null
    });

    req.flash('success', 'Review submitted.');
    res.redirect(`/inv/detail/${vehicle_id}`);
  } catch (err) {
    next(err);
  }
};

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review-controller');

router
  .route('/private')
  .post(reviewController.privateReview)
  .get(reviewController.getUserPrivateReview);

router.route('/open-review').get(reviewController.review_qr_code);
router
  .route('/opne-qr-code-store')
  .post(reviewController.qr_code_user_data_store)
  .get(reviewController.qr_code_user_data_get);

module.exports = router;

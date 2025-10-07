const express = require('express');
const router = express.Router();
const customerSupportController = require('../controllers/customerSupport-controller');
const { isCheckUser } = require('../middlewares/checkUserValid-middleware');

router.use(isCheckUser);
router.route('/email').post(customerSupportController.sendEmail);

module.exports = router;

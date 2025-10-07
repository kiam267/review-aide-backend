const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketing-controller');
const { isCheckUser } = require('../middlewares/checkUserValid-middleware');

router.use(isCheckUser);
router.route('/').post(marketingController.marketingUserStore);

module.exports = router;

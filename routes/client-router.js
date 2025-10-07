const express = require('express');
const router = express.Router();
const clientController = require('../controllers/client-controller');
const { isCheckUser } = require('../middlewares/checkUserValid-middleware');

router.route('/review').get(clientController.getVisitor);
router.route('/methods').put(clientController.methodsClickVisitor);

router.use(isCheckUser);
router
  .route('/')
  .post(clientController.visitor)
  .get(clientController.getAllSendData);

router.route('/unsubscribe').put(clientController.unsubscribe);
router
  .route('/qr_gen')
  .get(clientController.qr_code_get)
  .post(clientController.qr_code_gen)
  .delete(clientController.qr_code_delete);



module.exports = router;

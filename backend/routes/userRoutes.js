const expressRouter = require('express');
const router = expressRouter.Router();
const userController = require('../controllers/userController.js');
const { verifyToken }  = require('../middlewares/auth.js');

router.get('/details', verifyToken, userController.getUserDetails);
router.get('/currentUser', verifyToken, userController.currentUser);

module.exports = router;
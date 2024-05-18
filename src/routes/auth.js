const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');


router.post('/register', authController.postRegister);
router.post('/login', authController.postLogin);

router.post('/sendotp', authController.postSendOtp);
router.post('/verifyotp', authController.postVerifyOtp);
router.post('/reset',authController.postReset);
router.post('/forgot', authController.postForgot);

router.post('/refresh',authController.refreshToken);




module.exports = router;

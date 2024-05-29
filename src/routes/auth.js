const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth');


router.post('/register', authController.postRegister);
router.post('/login', authController.postLogin);

router.post('/send-otp', authController.postSendOtp);
router.post('/verify-otp', authController.postVerifyOtp);
router.post('/reset-password',authController.postReset);
router.post('/forgot-password', authController.postForgot);

router.post('/refresh-token',authController.refreshToken);




module.exports = router;

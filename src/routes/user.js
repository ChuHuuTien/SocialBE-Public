const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

router.get('/all', userController.getAllUser);
router.get('/listfollow', userController.getListFollow);
router.get('/info', userController.getUser);

router.post('/follow', userController.followUser);
router.post('/updateuser', userController.postUpdateUser);
router.post('/resetpass', userController.postResetPass);
router.delete('/delete', userController.deleteUser);




module.exports = router;

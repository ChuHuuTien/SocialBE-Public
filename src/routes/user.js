const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

router.get('/:userid', userController.getUser);
router.get('/all', userController.getAllUser);
router.get('/:userid/friends', userController.getUserFriend);
router.get('/friend/myrequest', userController.getMyRequest);
router.get('/friend/request', userController.getFriendRequest);


router.post('/updatefriend', userController.postUpdateFriend);
router.post('/updateuser', userController.postUpdateUser);
router.post('/resetpass', userController.postResetPass);





module.exports = router;

const express = require('express');
const router = express.Router();

const userController = require('../controllers/user');

router.get('/all', userController.getAllUser);
router.get('/list-user', userController.getListUser);
router.get('/info', userController.getUser);

router.post('/follow', userController.followUser);
router.post('/update-user', userController.postUpdateUser);
router.delete('/delete', userController.deleteUser);




module.exports = router;

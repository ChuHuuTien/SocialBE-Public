const express = require('express');
const router = express.Router();

const postController = require('../controllers/post');

router.get('/news', postController.getNews);
router.get('/by-user', postController.getPostsByUser);
router.get('/details/:postId', postController.getPost);
router.get('/:postid/comments', postController.getCommentsByPost);

router.post('/create', postController.createPost);
router.post('/update',postController.postUpdate)
router.post('/like', postController.postLike);
router.post('/:postid/comment', postController.postComment);

router.delete('/:postid', postController.deletePost);
router.delete('/:commentid/comment', postController.deleteComment);



module.exports = router;

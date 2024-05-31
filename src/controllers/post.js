
const Comment = require('../models/comment');
const Post = require('../models/post');
const User = require('../models/user');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');
const { options } = require('../routes/post');

class postController {

  // [GET] /post/details/:postId
  async getPost(req, res, next) {
    const postId = req.params.postId;
    try {
      const post = await Post.getPostById(postId);
      res.status(200).json({ message: "Success", data: post });

    } catch (err) {
      res.status(400).json({ message: err });
    }
  }

  // [GET] /post/by-user
  async getPostsByUser(req, res, next) {
    const userId = req.query.userId;
    const options = {
      page: (req.query.page) || 0,
      limit: (req.query.limit) || 10,
    };
    try {
      const posts = await Post.getPostsByAuthorId(userId, options);
      res.status(200).json({ message: "Success", data: posts });
    } catch (err) {
      res.status(400).json({ message: err });
    }
  }

  // [POST] /post/create
  async createPost(req, res, next) {
    try {
      const content = req.body.content;
      const images = req.body.images;
      const newPost = {
        authorId: req.body.authorId,
        content: content,
        images: images,
      }
      const createPost = await Post.createPost(newPost);
      if (!createPost) {
        return res.status(400).josn({ message: "There was an error creating the post, please try again" });
      }
      const post = await Post.getPostById(createPost._id);
      return res.status(200).json({ data: post });
    } catch (error) {
      console.log(error)
      res.status(400).json({ message: error });
    }
  }

  // [POST] /post/like
  async postLike(req, res, next) {
    try {
      const postid = req.body.postId;
      const currentLoggedUser = req.body.userId;
      const status = await Post.likePost(postid, currentLoggedUser);
      const post = await Post.getPostById(postid);
      if (post) {
        return res.status(200).json({ status, data: post });
      } else {
        return res.status(400).json({ data: "error when like post" });
      }
    } catch (error) {
      res.status(409).json({ error });
    }
  }
  // [POST] /post/update
  async postUpdate(req, res, next) {
    try {
      const postid = req.body.postId;
      const body = req.body;
      const post = await Post.updatePost(postid, body);
      if (post) {
        res.status(200).json({ message: "Update post success", data: post });
      } else res.status(400).json({ message: "Update post fail" });
    } catch (error) {
      res.status(409).json({ error });
    }
  }
  // [POST] /post/:postid/comment
  async postComment(req, res, next) {
    try {
      const postid = req.params.postid;
      const currentLoggedUser = req.user.userid;
      const comment = req.body.comment;
      const newComment = {
        postId: postid,
        content: comment,
        creatorId: currentLoggedUser,
      }
      const createComment = await Comment.createCommentInPost(newComment);
      await Post.plusComment(postid, 1);

      if (!createComment) {
        return res.status(400).josn({ message: "Có lỗi trong quá trình tạo bình luận, vui lòng thử lại." });
      }
      return res.status(201).json({ comment: createComment });
    } catch (error) {
      console.log(error)
      res.status(409).json({ error: error });
    }
  }
  // [GET] /post/:postid/comment
  async getCommentsByPost(req, res, next) {
    try {
      const postid = req.params.postid;
      const options = {
        page: (req.query.page) || 1,
        limit: (req.query.limit) || 10,
      };

      const Comments = await Comment.getCommentsByPostId(postid, options);
      return res.status(201).json({ comments: Comments });
    } catch (error) {
      res.status(409).json({ error: error });
    }
  }

  // [GET] /post/getNews
  async getNews(req, res, next) {
    try {
      const userId = req.body.userId;
      const result = await User.getUserById(userId);
      const friendids = result.following;
      friendids.push(new mongoose.Types.ObjectId(userId));
      const options = {
        page: (req.query.page) || 1,
        limit: (req.query.limit) || 10,
      };
      const news = await Post.getPostByFriendIds(friendids, options);
      return res.status(201).json({ news });
    } catch (error) {
      console.log(error);
      res.status(409).json({ error: error });
    }
  }

  // [DELETE] /post/:postid
  async deletePost(req, res, next) {
    try {
      const postid = req.params.postid;
      const post = await Post.getPostById(postid);
      const imageSrcs = post.imageSrcs;
      const regex = /upload\/(?:v\d+\/)?([^\.]+)/
      imageSrcs.map((img) => {
        const match = regex.exec(img);
        const public_id = match[1];
        cloudinary.uploader.destroy(public_id);
      })
      await Comment.deleteAllCommentByPost(postid);
      const response = await Post.deletePostById(postid);
      if (response) return res.status(200).json({ message: "Delete post success!" });
    } catch (error) {
      res.status(409).json({ error: error });
    }
  }

  // [DELETE] /post/:commentid/comments
  async deleteComment(req, res, next) {
    try {
      const commentid = req.params.commentid;
      const comment = await Comment.findOne({ _id: commentid });
      const response = await Comment.deleteComment(commentid);
      await Post.plusComment(comment.postId, -1);
      if (response) return res.status(200).json({ message: "Delete comment success!" });
    } catch (error) {
      res.status(409).json({ error: error });
    }
  }
}

module.exports = new postController();

const User = require('../models/user')
const bcrypt = require("bcrypt");
const { SALT_ROUNDS } = require("../variables/auth");

class userController {

  // [GET] /user/info
  async getUser(req, res, next) {
    const userid = req.query.id;
    try {
      const user = await User.getUserById(userid);
      res.status(200).json({ message: "Success", user: user });

    } catch (err) {
      res.status(400).json({ err: err });
    }
  }

  // [GET] /user/all
  async getAllUser(req, res, next) {
    try {
      const result = await User.getAllUser();
      res.status(200).json({ message: "Success", users: result });

    } catch (err) {
      res.status(400).json({ err: err });
    }
  }

  // [POST] /user/follow
  async followUser(req, res, next) {
    const userId = req.body.userId;
    const friendId = req.body.friendId;
    try {
      const isFollowing = await User.isFollowing(userId, friendId);
      if (!isFollowing || isFollowing == null) {
        const resData = await User.follow(userId, friendId);
        if (resData) {
          res.status(200).json({ message: "follow success", user: resData });
        } else {
          res.status(400).json({ message: "follow fail" });
        }
      } else {
        const resData = await User.unfollow(userId, friendId);
        if (resData) {
          res.status(200).json({ message: "unfollow success", user: resData });
        } else {
          res.status(400).json({ message: "unfollow fail" });
        }
      }
    } catch (err) {
      res.status(400).json({ err: err });
    }
  }

  // [GET] /user/listuser
  async getListUser(req, res, next) {
    const listId = req.body.listId;
    const options = {
      page: (req.query.page) || 0,
      limit: (req.query.limit) || 10,
    };
    try {
      const users = await User.getUserByIds(listId, options);

      res.status(200).json({ users: users });

    } catch (err) {
      console.log(err);
      res.status(400).json({ err: err });
    }
  }

  // [POST] /user/postUpdateUser
  async postUpdateUser(req, res, next) {
    const id = req.query.id;
    const body = req.body;
    try {
      const user = await User.updateUser(id, body);
      if (user) {
        res.status(200).json({ message: "Update user success", user: user });
      } else res.status(400).json({ message: "Update user fail" });
    } catch (err) {
      res.status(400).json({ err: err });
      console.log(err);
    }
  }

  // [POST] /user/resetpass
  async postResetPass(req, res, next) {
    const userid = req.query.id;
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    console.log(req.body);
    const user = await User.getUserToChangePass(userid);
    if (!user) {
      return res.status(401).json({ error: "No one exist with this id" });
    }
    const isPasswordValid = bcrypt.compareSync(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Mật khẩu không chính xác." });
    }
    try {
      const hashPassword = bcrypt.hashSync(newPassword, SALT_ROUNDS);
      const user = await User.updatePassword(userid, hashPassword);
      if (user) {
        res.status(200).json({ message: "Reset Password success", user: user });
      } else res.status(400).json({ message: "Reset Password fail" });
    } catch (err) {
      res.status(400).json({ err: err });
    }
  }

  //[DELETE] /user/delete
  async deleteUser(req, res, next) {
    try {
      const { id } = req.query;

      const findUserResult = await User.getUserById(id);

      if (findUserResult) {
        const deleteRes = await User.deleteUser(findUserResult._id);
        if (!deleteRes) {
          res.status(200).json({ message: "delete successful" });
        } else {
          res.status(400).json({ message: "delete fail" });
        }
      } else {
        res.status(400).json({ message: "account not exist" });
      }
    } catch (err) {
      res.status(400).json({ err: err });
    }
  }
}

module.exports = new userController();

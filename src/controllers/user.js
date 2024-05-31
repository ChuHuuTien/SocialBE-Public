const User = require('../models/user')
const bcrypt = require("bcrypt");
const { SALT_ROUNDS } = require("../variables/auth");

class userController {

  // [GET] /user/info
  async getUser(req, res, next) {
    const userid = req.query.id;
    try {
      const user = await User.getUserById(userid);
      res.status(200).json({ data: user });

    } catch (err) {
      res.status(400).json({ data: err });
    }
  }

  // [GET] /user/all
  async getAllUser(req, res, next) {
    try {
      const result = await User.getAllUser();
      res.status(200).json({ data: result });

    } catch (err) {
      res.status(400).json({ data: err });
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
          res.status(200).json({ message: "follow success", data: resData });
        } else {
          res.status(400).json({ data: "Somthing went wrong" });
        }
      } else {
        const resData = await User.unfollow(userId, friendId);
        if (resData) {
          res.status(200).json({ message: "unfollow success", data: resData });
        } else {
          res.status(400).json({ message: "Somthing went wrong" });
        }
      }
    } catch (err) {
      res.status(400).json({ err: err });
    }
  }

  // [GET] /user/list-user
  async getListUser(req, res, next) {
    const listId = req.body.listId;
    const options = {
      page: (req.query.page) || 0,
      limit: (req.query.limit) || 10,
    };
    try {
      const users = await User.getUserByIds(listId, options);

      res.status(200).json({ data: users });

    } catch (err) {
      console.log(err);
      res.status(400).json({ err: err });
    }
  }

  // [POST] /user/update-user
  async postUpdateUser(req, res, next) {
    const id = req.query.id;
    const body = req.body;
    try {
      const user = await User.updateUser(id, body);
      if (user) {
        res.status(200).json({ message: "Update user success", data: user });
      } else res.status(400).json({ message: "Update user fail" });
    } catch (err) {
      res.status(400).json({ err: err });
      console.log(err);
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
          res.status(200).json({ data: "delete successful" });
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

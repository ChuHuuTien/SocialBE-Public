const User = require('../models/user')
const FriendRequest = require('../models/friendrequest')
const cloudinary = require('../config/cloudinary');
const bcrypt = require("bcrypt");
const { SALT_ROUNDS } = require("../variables/auth");

class userController {

  // [GET] /user/:id
  async getUser(req, res, next) {
    const userid = req.params.userid;
    try {
      const user = await User.getUserById(userid);
      res.status(200).json({ message: "Success", user: user });

    } catch (err) {
      res.status(400).json({ err: err });
    }
  }

  // [GET] /user/:id/friend
  async getUserFriend(req, res, next) {
    // const userid = req.user.userid;
    const userid = req.params.userid;
    try {
      const result = await User.getFriendById(userid);
      res.status(200).json({ message: "Success", friends: result.friends });

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

  // [GET] /user/friend/request
  async getFriendRequest(req, res, next) {
    const userid = req.user.userid;

    try {
      const result = await FriendRequest.getAllFriendReqById(userid);
      const Ids = result.map((id) => { return id.sender });
      const users = await User.getUserByIds(Ids);

      res.status(200).json({ friendrequest: users });

    } catch (err) {
      console.log(err);
      res.status(400).json({ err: err });
    }
  }
  // [GET] /user/friend/myrequest
  async getMyRequest(req, res, next) {
    const userid = req.user.userid;

    try {
      const result = await FriendRequest.getMyRequest(userid);
      const Ids = result.map((id) => { return id.receiver });
      // const users = await User.getUserByIds(Ids);

      res.status(200).json({ myRequest: Ids });

    } catch (err) {
      console.log(err);
      res.status(400).json({ err: err });
    }
  }
  // [POST] /user/updatefriend
  async postUpdateFriend(req, res, next) {
    const userid = req.user.userid;
    const friendid = req.body.friendid;
    const isAccept = req.body.isAccept;
    //3 việc: tạo request mới, chập nhận, từ chối
    try {
      const isFriend = await User.isFriend(userid, friendid);
      if (isFriend) {
        //Đã kết bạn và hủy kết bạn
        await User.updateFriend(userid, friendid);
        await User.updateFriend(friendid, userid);
        const result = await User.getFriendById(userid);
        res.status(200).json({ message: "Unfriend success", friends: result.friends });
      } else {
        //Kiểm tra có yêu cầu kết bạn hay không
        const isExist = await FriendRequest.findFriendRequest(friendid, userid);
        if (isExist) {
          if (isAccept) {

            //Chấp nhận kết bạn 
            await User.updateFriend(userid, friendid);
            await User.updateFriend(friendid, userid);
            await FriendRequest.deleteFriendRequest(friendid, userid);
            const result = await User.getFriendById(userid);
            res.status(200).json({ message: "Accept Friend require", friends: result.friends });
          } else {
            //Hủy yêu cầu kết bạn 
            await FriendRequest.deleteFriendRequest(friendid, userid);
            const result = await User.getFriendById(userid);
            res.status(200).json({ message: "Deny Friend require", friends: result.friends });
          }
        } else {
          const newRequest = {
            sender: userid,
            receiver: friendid,
          };
          await FriendRequest.createFriendRequest(newRequest);
          res.status(200).json({ message: "Add request success" });
        }
      }

    } catch (err) {
      res.status(400).json({ err: err });
    }
  }

  // [POST] /user/postUpdateUser
  async postUpdateUser(req, res, next) {
    const id = req.query.id;
    const body = req.body;
    const oldAvatar = req.body.avatar;
    try {
      if (req.body.avatar) {
        const regex = /upload\/(?:v\d+\/)?([^\.]+)/
        const match = regex.exec(oldAvatar);
        let public_id;
        if (match == null) {
          const uploadedResponse = await cloudinary.uploader.upload(req.body.avatar, {
            upload_preset: 'avatar',
          })
          body.avatar = uploadedResponse.url;
        } else {
          public_id = match[1];
        }
        if (public_id == "Avatar/avatar-icon-2_blug9u") {
          const uploadedResponse = await cloudinary.uploader.upload(req.body.oldAvatar, {
            upload_preset: 'avatar',
            folder: 'Avatar',
          })
          body.avatar = uploadedResponse.secure_url;
        } else {
          const uploadedResponse = await cloudinary.uploader.upload(req.body.avatar, {
            upload_preset: 'avatar',
            // folder: 'Avatar',
            invalidate: true,
            public_id: public_id
          })
          body.avatar = uploadedResponse.url;
        }
      }
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
    const userid = req.user.userid;
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
      const {id} = req.query;

      const findUserResult = await User.getUserById(id);
  
      if(findUserResult) {
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

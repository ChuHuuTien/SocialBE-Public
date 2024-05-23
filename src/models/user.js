const mongoose = require('mongoose');
const email = require('../validate/email');
const { ObjectId } = require('mongodb');
const { refreshToken } = require('../controllers/auth');
const Schema = mongoose.Schema;


const userSchema = new Schema({
  name: { type: String, required: true, min: 2, max: 50, },
  email: { type: String, required: true, max: 50, unique: true, },
  password: { type: String, minlength: 6, require: true },
  phone: { type: String, require: false, default: null },
  avatar: { type: String, require: true, default: 'https://res.cloudinary.com/dckxgux3k/image/upload/v1690426439/Avatar/avatar-icon-2_blug9u.png' },
  coverImage: { type: String, require: false, default: null },
  description: { type: String, require: false, default: null },
  follower: [{ _id: false, type: Schema.Types.ObjectId, ref: 'user' }],
  following: [{ _id: false, type: Schema.Types.ObjectId, ref: 'user' }],
  isNewAccount: { type: Boolean, require: false, default: true },
  emailVerify: { type: Boolean, require: false, default: false },
  refreshToken: { type: String, require: false, }
}, {
  timestamps: true,
  collection: "users",
  versionKey: false,
});



/**
 * @param {String} email - email of user
 * @return {Object} user who have this email
 */
userSchema.statics.getUserbyEmail = async function (email) {
  try {
    const user = await this.findOne({ email: email });
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} userid - id of user
 * @return {Object} user who have this userid
 */
userSchema.statics.getUserById = async function (userid) {
  try {
    const user = await this.findOne({ _id: userid }, { password: 0 });
    return user;
  } catch (error) {
    throw error;
  }
}
/**
 * @param {Array} ids, string of user ids
 * @return {Array of Objects} users list
 */
userSchema.statics.getUserByIds = async function (ids) {
  try {
    const users = await this.find({ _id: { $in: ids } }, { name: 1, avatar: 1 });
    return users.toObject();
  } catch (error) {
    throw error;
  }
}
/**
 * @return {Array} List of all users
 */
userSchema.statics.getAllUser = async function () {
  try {
    const allUsers = await this.find({}, { password: 0, refreshToken: 0 });
    return allUsers;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} id - id of user
 * @return {Object} - array friend of user
 */
userSchema.statics.getFriendById = async function (id) {
  try {
    const aggregate = await this.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id) } },
      { $project: { _id: 0, friends: 1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'friends',
          foreignField: '_id',
          pipeline: [{ $project: { firstName: 1, lastName: 1, email: 1, avatar: 1 } }],

          as: 'friends',
        }
      },
      // { $unwind: "$friends"}
    ]);
    return aggregate[0];
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Object} user
 * @returns {Object} new user object created
 */
userSchema.statics.createUser = async function (user) {
  try {
    user = new this(user);
    const createUserResult = await user.save();
    const resData = createUserResult.toObject();
    delete resData.password;
    delete resData.updatedAt;
    return resData;


  } catch (error) {
    throw error;
  }
}
/**
 * @param {String} id - id of user
 * @return {Object} - details of action performed
 */




/**
 * @param {String} userid - email
 * @param {String} friendid - friendid
 * @return {boolean}
 */
userSchema.statics.updateFriend = async function (userid, friendid) {
  try {
    const result = await this.find({ _id: userid, friends: { $all: friendid } });
    if (!result.length) {
      await this.updateOne({ _id: userid }, { $push: { friends: friendid } })
      return true;
    } else {
      await this.updateOne({ _id: userid }, { $pull: { friends: friendid } })
      return false;
    }
  } catch (error) {
    return error;
  }
}

userSchema.statics.isFriend = async function (userid, friendid) {
  try {
    const result = await this.find({ _id: userid, friends: { $all: friendid } });
    if (!result.length) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    return error;
  }
}
/**
 * @param {String} userid - id of user
 * @return {Object} user who have this userid
 */
userSchema.statics.updateUser = async function (userid, change) {
  try {
    await this.updateOne({ _id: { $in: userid } }, { $set: change });
    const aggregate = await this.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userid) } },
      { $project: { password: 0, createdAt: 0, updatedAt: 0, refreshToken: 0 } },
    ]);
    return aggregate[0];
  } catch (error) {
    throw error;
  }
}

userSchema.statics.deleteUser = async function (id) {
  await this.deleteOne({ _id: { $in: id } });
}


/**
 * @param {String} email - email
 * @param {String} refreshToken - refreshToken
 * @return {boolean}
 */
userSchema.statics.updateRefreshToken = async function (id, refreshToken) {
  try {
    await this.updateOne({ _id: id }, { refreshToken: refreshToken })
    return true;
  } catch {
    return false;
  }
}

/**
 * @param {String} email - email
 * @param {String} refreshToken - refreshToken
 * @return {boolean}
 */
userSchema.statics.getUserToChangePass = async function (userid) {
  try {
    const user = await this.findOne({ _id: userid });
    return user;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} email - email
 * @param {String} refreshToken - refreshToken
 * @return {boolean}
 */
userSchema.statics.updatePassword = async function (userid, newPassword) {
  try {
    await this.updateOne({ _id: userid }, { password: newPassword })
    return true;
  } catch {
    return false;
  }
}

module.exports = mongoose.model('User', userSchema);


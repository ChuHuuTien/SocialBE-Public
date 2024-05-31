const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    authorId: { _id: false, type: Schema.Types.ObjectId, ref: 'user' },
    content: { type: String, required: true },
    images: [
      { _id: false, type: String, default: "" }
    ],
    likes: [{ _id: false, type: Schema.Types.ObjectId, ref: 'user' }],
    commentLength: { type: Number, default: 0 }
  },
  {
    timestamps: true,
    collection: "posts",
    versionKey: false,
  }
);

/**
 * @param {String} postid - id of post
 * @return {Object} post
 */
postSchema.statics.getPostById = async function (postid) {
  try {
    // const post = await this.findOne({ _id: postid });
    // return post;
    const aggregate = await this.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(postid) } },
      {
        $lookup: {
          from: 'users',
          localField: 'authorId',
          pipeline: [{ $project: { name: 1, avatar: 1 } }],
          foreignField: '_id',
          as: 'author',
        }
      },
      { $unwind: "$author" }
    ])
    return aggregate[0];
  } catch (error) {
    throw error;
  }
}


/**
 * @param {Object} post
 * @returns {Object} new post object created
 */
postSchema.statics.likePost = async function (postid, userid) {
  try {
    const result = await this.find({ _id: postid, likes: { $all: userid } });
    if (!result.length) {
      await this.updateOne({ _id: postid }, { $push: { likes: userid } })
      return { message: "Like" };
    } else {
      await this.updateOne({ _id: postid }, { $pull: { likes: userid } })
      return { message: "Unlike" };
    }
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Object} post
 * @returns {Object} new length of comment this post
 */
postSchema.statics.plusComment = async function (postid, number) {
  try {
    await this.updateOne({ _id: postid }, { $inc: { commentLength: number } })
    return { message: "Plus comment success" };

  } catch (error) {
    throw error;
  }
}
/**
 * @param {String} postid - id of user
 * @return {Object} user who have this postid
 */
postSchema.statics.updatePost = async function (postid, change) {
  try {
    await this.updateOne({ _id: postid }, change);
    const aggregate = await this.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(postid) } },
      {
        $lookup: {
          from: 'users',
          localField: 'authorId',
          pipeline: [{ $project: { name: 1, avatar: 1 } }],
          foreignField: '_id',
          as: 'author',
        }
      },
      { $unwind: "$author" },
    ])
    return aggregate[0];
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Object} post
 * @returns {Object} new post object created
 */
postSchema.statics.createPost = async function (post) {
  try {
    post = new this(post);
    const createResult = await post.save();
    const resData = createResult.toObject();
    delete resData.updatedAt;
    return resData;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {String} postid - id of post
 * @return {Object} post
 */
postSchema.statics.getPostsByAuthorId = async function (userid, options) {
  try {
    const aggregate = await this.aggregate(
      [{ $match: { authorId: new mongoose.Types.ObjectId(userid) } },
      {
        $lookup: {
          from: 'users',
          localField: 'authorId',
          pipeline: [{ $project: { name: 1, avatar: 1 } }],
          foreignField: '_id',
          as: 'author',
        }
      },
      { $unwind: "$author" },
      { $sort: { createdAt: -1 } },
      { $skip: parseInt(options.page - 1) },
      { $limit: parseInt(options.limit) },]);
    return aggregate;
  } catch (error) {
    throw error;
  }
}
/**
 * @param {Object} post
 * @returns {Object} new post object created
*/
postSchema.statics.getPostByFriendIds = async function (friendIds, options) {
  try {
    const aggregate = await this.aggregate([
      { $match: { authorId: { $in: friendIds } } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'authorId',
          pipeline: [{ $project: { name: 1, avatar: 1 } }],
          foreignField: '_id',
          as: 'author',
        }
      },
      { $unwind: "$author" },
      { $skip: parseInt(options.page - 1) },
      { $limit: parseInt(options.limit) }
    ]);
    return aggregate;
  } catch (error) {
    throw error;
  }
}

/**
 * @param {Object} post
 * @returns {Object} new post object created
*/
postSchema.statics.deletePostById = async function (postid) {
  try {
    await this.deleteOne({ _id: postid });
    return true;
  } catch (error) {
    throw error;
  }
}

module.exports = mongoose.model('Post', postSchema);

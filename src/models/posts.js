import mongoose from "mongoose";
const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    likeNumber: Number,
    userId: String,
    url: String,
    token: String,
    image: [String],
    described: {
      type: String,
      maxLength: 500,
    },
    status: String,
    author: {
      authorId: String,
      name: String,
      avatar: String,
      online: String,
    },
    state: String,
    is_blocked: String,
    can_edit: String,
    banned: String,
    can_comment: String,
  },
  {
    auto_accept: String,
    auto_block: String,
  },
  { timestamps: true }
);

const PostsModel = mongoose.model("posts", PostSchema);

module.exports = PostsModel;

// image: {
//     type: Array,
//     id: {
//         type: String,
//     },
//     url: {
//         type: String,
//     }
// },
// author: {
//     type: Array,
//     id: {
//         type: String,
//     },
//     name: {
//         type: String,
//     },
//     avatar: {
//         type: String,
//     },
//     online: {
//         type: Boolean,
//     }
// },
// is_blocked: {
//     type: Boolean,
// },
// can_edit: {
//     type: Boolean,
// },
// banned: {
//     type: Number,
// },
// can_comment: {
//     type: Boolean,
// },
// url: {
//     type: String,
// },
// messages: {
//     type: Array,
// },

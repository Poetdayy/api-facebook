import mongoose from "mongoose";
const { Schema } = mongoose;

const PostSchema = new Schema(
  {
    likeNumber: Number,
    userId: String,
    url: String,
    token: String,
    image: [{ type: String }],
    described: {
      type: String,
      maxLength: 100,
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

import mongoose from 'mongoose';
const { Schema } = mongoose;

const CommentsSchema = new Schema(
    {
      postID: {
        type: String,
      },
      index: {
        type: String,
        required: true,
      },
      count: {
        type: String,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },  
      poster: {
        type: Array,
        required: true,
        id: String,
        name: String,
        avatar: String,
      },
      is_blocked: {
        type: String,
      }
    },
    { timestamps: true }
)

const Comment = mongoose.model('comments', CommentsSchema);

module.exports = Comment;


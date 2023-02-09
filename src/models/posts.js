import mongoose from 'mongoose';
const { Schema } = mongoose;

const PostSchema = new Schema(
    {
        userId: String,
        url: String,
        token: {
            type: String,
            ref: 'accounts',
        },
        image: [{type: String}],
        video: [{type: String}],
        described: {
            type: String,
            maxLength: 100,
        },
        status: String,
        state: String,
        can_edit: String,
        banned: String,
        can_comment: String,
        auto_accept: String,
        auto_block: String,
        likes: [{type: String}],
        comments: [], 
    },
    { timestamps: true }
)


const PostsModel = mongoose.model('posts', PostSchema);

module.exports = PostsModel;

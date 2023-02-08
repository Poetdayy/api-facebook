import mongoose from 'mongoose';
const { Schema } = mongoose;

mongoose.connect('mongodb://localhost/api-facebook', {
  useNewURLParser: true,
  useUnifieDTopology: true,
});

const UserSchema = new Schema(
  {
    id: String,
    username: String,
    phonenumber: String,
    created: Date,
    avatar: String,
    is_blocked: Boolean,
    online: Boolean,
    friendIds: [{ type: String, created: Date }],
    friendRequestIds: [{ type: String }],
    blocked_list: [{ type: String }],
    suggested_friendIds: [{ type: String, created: Date }],
  },
  {
    collection: 'users',
  }
);

const UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;

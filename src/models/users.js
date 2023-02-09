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
    friendIds: [{ id: String, created: Date }],
    friendRequestIds: [{ id: String, created: Date }],
    blocked_list: [{ type: String }],
    suggested_friendIds: [{ id: String, created: Date }],
  },
  {
    collection: 'users',
  }
);

const UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;

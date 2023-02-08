import mongoose from "mongoose";
const { Schema } = mongoose;

mongoose.connect("mongodb://localhost/api-facebook", {
  useNewURLParser: true,
  useUnifieDTopology: true,
});

const UserSchema = new Schema(
  {
    id: {
      type: String,
      ref: "accounts",
    },
    username: String,
    phoneNumber: String,
    created: Date,
    avatar: String,
    is_blocked: String,
    online: Boolean,
    friendIds: [{ type: String }],
    friendRequestIds: [{type: String}],
    blocked_list: [{type: String}],
  },
  {
    collection: "users",
  }
);

const UserModel = mongoose.model("users", UserSchema);

module.exports = UserModel;

import mongoose from "mongoose";
const { Schema } = mongoose;

mongoose.connect("mongodb://localhost/api-facebook", {
  useNewURLParser: true,
  useUnifieDTopology: true,
});

const AccountSchema = new Schema(
  {
    username: String,
    phoneNumber: String,
    password: String,
    token: [{type: String}],
    avatar: String,
    id: String,
  },
  {
    collection: "accounts",
  }
);

const AccountModel = mongoose.model("accounts", AccountSchema);

module.exports = AccountModel;

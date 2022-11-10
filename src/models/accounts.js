import mongoose from 'mongoose';
const { Schema } = mongoose;

mongoose.connect("mongodb://localhost/api-facebook", {
  useNewURLParser: true,
  useUnifieDTopology: true,
});

const AccountSchema = new Schema(
  {
    phoneNumber: String,
    password: String,
    token: String,
    expirationAccessTokenDate: Date,
    refreshToken: String,
    id: String,
  },
  {
    collection: "accounts",
  }
);

const AccountModel = mongoose.model('accounts', AccountSchema);

module.exports = AccountModel;

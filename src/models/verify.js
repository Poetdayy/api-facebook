import mongoose from "mongoose";
const { Schema } = mongoose;

mongoose.connect("mongodb://localhost/api-facebook", {
  useNewURLParser: true,
  useUnifieDTopology: true,
});

const VerifySchema = new Schema(
  {
    id: String,
    startTime: Number,
    verifyCode: String,
    verified: Boolean,
  },
  {
    collection: "verify",
  }
);

const VerifyModel = mongoose.model("verify", VerifySchema);

module.exports = VerifyModel;

import mongoose from 'mongoose';
const { Schema } = mongoose;

mongoose.connect("mongodb://localhost/api-facebook", {
    useNewURLParser: true,
    useUnifieDTopology: true,
});

const UserSchema = new Schema(
    {
        id: String,
        username: String,
        phoneNumber: String,
        created: Date,
        avatar: String,
        is_blocked: Boolean,
        online: Boolean,
    },
    {
        collection: "users",
    }
);

const UserModel = mongoose.model('users', UserSchema);

module.exports = UserModel;
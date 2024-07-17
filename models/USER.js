const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    profilePicture: String,
    bio: String
});

const User = mongoose.model('UserCollection', PostSchema);

module.exports = User;

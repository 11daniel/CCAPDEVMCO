const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    image: String
})

const User = mongoose.model('UserCollection', PostSchema)

module.exports = User

//for profile of user exports USER to index js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user: { type: String, required: true },
    avatar: String,
    title: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    comments: [String],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voted: []
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;

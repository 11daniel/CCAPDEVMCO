const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    user: String,
    title: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
    comments: [String],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voted: { type: String, default: null }
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;

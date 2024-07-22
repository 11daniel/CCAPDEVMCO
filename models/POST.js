const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    user: String,
    text: String,
    createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
    user: String,
    title: String,
    content: String,
    timestamp: { type: Date, default: Date.now },
    comments: [CommentSchema],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    voters: { type: Map, of: String, default: {} }
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;


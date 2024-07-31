///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// App stuff
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

const mongoose = require('mongoose');
const express = require('express');
const app = express();

//require DB
const connection = require("./models/connection");

const { envPort, dbURL, sessionKey } = require('./config');
const port = envPort || 3000; // Default to port 3000 if not set
const server = app.listen(port, () => console.log(`Example app listening on port ${port}!`));

app.use('/stylesheets', express.static(__dirname + '/stylesheets'));
app.use('/images', express.static(__dirname + '/images'));
app.use(express.static(__dirname));

const fileUpload = require('express-fileupload')

const Post = require("./models/Post");
const Community = require("./models/Community");
const Comment = require("./models/Comment");
const User = require("./models/User");

const path = require('path');

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const hbs = require('hbs')
app.set('view engine','hbs');

app.use(express.json()); // use json
app.use(express.urlencoded({extended: true})); // files consist of more than strings
app.use(express.static('public')); // we'll add a static directory named "public"
app.use(fileUpload()); // for fileuploads

const session = require('express-session');
const MongoStore = require('connect-mongo');

// Connect to MongoDB
mongoose.connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Could not connect to MongoDB Atlas', err));

hbs.registerHelper('calculateVotes', function(upvotes, downvotes) {
    return upvotes.length - downvotes.length;
});

hbs.registerHelper('reverse', function(array) {
    return array.slice().reverse();
});

hbs.registerHelper('sortByProperty', function(array, property) {
    return array.slice().sort((a, b) => {
        var valueA = a[property].toLowerCase(); 
        var valueB = b[property].toLowerCase(); 

        if (valueA < valueB) {
            return -1;
        } else if (valueA > valueB) {
            return 1;
        } else {
            return 0;
        }
    });
});

hbs.registerHelper('calculateTotalVotes', function(posts) {
    var totalUpvotes = 0;
    var totalDownvotes = 0;

    posts.forEach(post => {
        totalUpvotes += post.upvotes.length;
        totalDownvotes += post.downvotes.length;
    });

    // Calculate the difference between total upvotes and downvotes
    var difference = totalUpvotes - totalDownvotes;

    return difference;
});

hbs.registerHelper('times', function(number) {
    return number * 35;
});

hbs.registerHelper('length', function(array) {
    return array.length;
});

hbs.registerHelper('removeFirst', function(string) {
    return string.slice(1);
});

hbs.registerHelper('commentLevelSymbol', function(number) {
    var symbols = '';
    for (var i = 0; i < number; i++) {
        symbols += '|';
    }
    return symbols;
});

hbs.registerHelper('edited', function(number) {
    if (number === 1) {
        return 'Edited'
    } else {
        return ''
    }
});

hbs.registerHelper('upvotes', function(upvotes, username) {
    if (upvotes.includes(username)) {
        return username;
    }
});

hbs.registerHelper('downvotes', function(downvotes, username) {
    if (downvotes.includes(username)) {
        return username;
    }
});

//Session
app.use(
    session({
        secret: sessionKey,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 3 * 7 * 24 * 60 * 60 * 1000
        },
        store: MongoStore.create({ 
            mongoUrl: dbURL,
            collectionName: 'sessions' 
        })
    })
);

// Set username value after logging in
app.post('/submit-login', async function(req, res) {
    var { username, password, remember } = req.body;

    var user = await User.findOne({ username: username });

    if (user && user.password === password) {
        if (remember) {
            req.session.username = username;
            console.log('sessionUsername: ' + req.session.username)
        } else {
            req.session.username = username;
            req.session.cookie.expires = false;
        }
        res.redirect('/home');
    } else {
        res.redirect('/?login=failed');
    }
});

app.get('/', async function(req, res) {
    if (req.session.username) {
        req.session.username = req.session.username;
        res.redirect('/home');
    } else {
        res.render('index'); //index.hbs
    }
});

const guest = new User({
    username: '!!',
    img: 'profile.jpg',
    description: 'This is a guest user.',
    userSince: 0, 
    password: '!!' 
});

app.get('/guest', async function(req, res) {
    req.session.username = '!!'
    req.session.cookie.expires = false
    res.redirect('home')
});

app.get('/logout', async function(req, res) {
    req.session.destroy();
    res.redirect('/');
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Add stuff to db 
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Create post
app.post('/submit-post', async function(req, res) {
    var today = new Date();
    var formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

    var latestPost = await Post.findOne().sort({ postId: -1 });
    var newPostId = latestPost ? latestPost.postId + 1 : 1;

    await Post.create({
        postId: newPostId,
        date: formattedDate,
        user: req.session.username,
        upvotes: [],
        downvotes: [],
        edited: 0,
        ...req.body,
    });

    res.redirect('/home');
});

// Create community
app.post('/submit-community', async function(req, res) {
    var communityName = '#' + req.body.name
    if (await Community.findOne({ name: { $regex: new RegExp('^' + communityName + '$', 'i') } })) {
        res.redirect('/home?community=failed')
    } else {
        await Community.create({
            ...req.body,
            name: communityName
        });
        res.redirect('/home?community=success')
    }
});

// Create user
app.post('/submit-user', async function(req, res) {
    if (await User.findOne({ username: { $regex: new RegExp('^' + req.body.username + '$', 'i') } })) {
        res.redirect('/?register=failed')
    } else {
        var currentYear = new Date().getFullYear()
        await User.create({
            ...req.body,
            img: 'profile.jpg',
            description: '',
            userSince: currentYear,
        });
        res.redirect('/?register=success')
    }
});

// Create comment
app.post('/submit-comment', async function(req, res) {
    var postId = Number(req.query.postId);
    if (req.session.username !== '!!') { 
        var today = new Date();
        var formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

        var latestComment = await Comment.findOne().sort({ commentId: -1 });
        var newCommentId = latestComment ? latestComment.commentId + 1 : 1;

        await Comment.create({
            commentId: newCommentId,
            date: formattedDate,
            postId: postId,
            user: req.session.username,
            upvotes: [],
            downvotes: [],
            edited: 0,
            ...req.body,
        });
        res.redirect(`/posts?postId=${postId}`);
    } else {
        res.redirect(`/posts?postId=${postId}`);
    }
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Modify stuff in db 
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Save post edits
app.post('/save-post', async function(req, res) {
    var { postId, title, content, community } = req.body;
    var post = await Post.findOneAndUpdate(
        { postId: postId },
        { $set: { title: title, content: content, community: community, edited: 1 } }
    );
    res.redirect('/home')
});

// Save comment edits
app.post('/save-comment', async function(req, res) {
    var { commentId, postId, content } = req.body;
    var comment = await Comment.findOneAndUpdate(
        { commentId: commentId },
        { $set: { content: content, edited: 1 } }
    );
    res.redirect(`/posts?postId=${postId}`);
});

// Upvote post
app.post('/upvote-post', async function(req, res) {
    var postId = Number(req.query.postId);
    var post = await Post.findOne({ postId: postId });
    if (post.downvotes.includes(req.session.username)) {
        await Post.updateOne(
            { postId: postId },
            { $pull: { downvotes: req.session.username } }
        );
    }

    if (!post.upvotes.includes(req.session.username)) {
        await Post.updateOne(
            { postId: postId },
            { $push: { upvotes: req.session.username } }
        );
    } else {
        await Post.updateOne(
            { postId: postId },
            { $pull: { upvotes: req.session.username } }
        );
    }

    res.redirect(`/posts?postId=${postId}`);
});

// Downvote post
app.post('/downvote-post', async function(req, res) {
    var postId = Number(req.query.postId);
    var post = await Post.findOne({ postId: postId });
    if (post.upvotes.includes(req.session.username)) {
        await Post.updateOne(
            { postId: postId },
            { $pull: { upvotes: req.session.username } }
        );
    }

    if (!post.downvotes.includes(req.session.username)) {
        await Post.updateOne(
            { postId: postId },
            { $push: { downvotes: req.session.username } }
        );
    } else {
        await Post.updateOne(
            { postId: postId },
            { $pull: { downvotes: req.session.username } }
        );
    }

    res.redirect(`/posts?postId=${postId}`);
});

// Upvote comment
app.post('/upvote-comment', async function(req, res) {
    var commentId = Number(req.query.commentId);
    var postId = Number(req.query.postId);
    var comment = await Comment.findOne({ commentId: commentId });
    if (comment.downvotes.includes(req.session.username)) {
        await Comment.updateOne(
            { commentId: commentId },
            { $pull: { downvotes: req.session.username } }
        );
    }

    if (!comment.upvotes.includes(req.session.username)) {
        await Comment.updateOne(
            { commentId: commentId },
            { $push: { upvotes: req.session.username } }
        );
    } else {
        await Comment.updateOne(
            { commentId: commentId },
            { $pull: { upvotes: req.session.username } }
        );
    }

    res.redirect(`/posts?postId=${postId}`);
});

// Downvote comment
app.post('/downvote-comment', async function(req, res) {
    var commentId = Number(req.query.commentId);
    var postId = Number(req.query.postId);
    var comment = await Comment.findOne({ commentId: commentId });
    if (comment.upvotes.includes(req.session.username)) {
        await Comment.updateOne(
            { commentId: commentId },
            { $pull: { upvotes: req.session.username } }
        );
    }

    if (!comment.downvotes.includes(req.session.username)) {
        await Comment.updateOne(
            { commentId: commentId },
            { $push: { downvotes: req.session.username } }
        );
    } else {
        await Comment.updateOne(
            { commentId: commentId },
            { $pull: { downvotes: req.session.username } }
        );
    }

    res.redirect(`/posts?postId=${postId}`);
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Render stuff
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Register pages
app.get('/register', function(req, res) {
    res.render('register');
});

// Profile pages
app.get('/profile', async function(req, res) {
    var userId = req.query.userId;
    if (userId) {
        var user = await User.findOne({ _id: userId });
        if (user) {
            var posts = await Post.find({ user: user.username });
            var communities = await Community.find({});
            res.render('profile', { user: user, posts: posts, communities: communities });
        } else {
            res.status(404).send('User not found');
        }
    } else {
        res.status(400).send('UserId parameter is required');
    }
});

// Post pages
app.get('/posts', async function(req, res) {
    var postId = req.query.postId;
    var communities = await Community.find({});
    if (postId) {
        var post = await Post.findOne({ postId: postId });
        var comments = await Comment.find({ postId: postId });
        res.render('posts', { post: post, comments: comments, communities: communities });
    } else {
        res.status(404).send('Post not found');
    }
});

// Home page
app.get('/home', async function(req, res) {
    var communities = await Community.find({});
    var posts = await Post.find({});
    res.render('home', { posts: posts, communities: communities });
});

const express = require("express");
const session = require("express-session");
const fileUpload = require('express-fileupload');
const cookieParser = require("cookie-parser");
const path = require('path');
const mongoose = require('mongoose');
const hbs = require('hbs');
const fs = require('fs');

const dbURL = "mongodb+srv://admin:foiTTXlNEKLaJBwL@ccapdev.ifalvu3.mongodb.net/?retryWrites=true&w=majority&appName=ccapdev";

mongoose.connect(dbURL).then(() => {
    console.info('Connected to App Demo Data Base');
}).catch((e) => {
    console.log('Error Connecting to App Demo Data Base');
});

const Post = require("./models/POST");
const User = require("./models/USER");

const app = express();
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'hbs');

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(fileUpload());

app.use(
    session({
        secret: "secret-key",
        resave: false,
        saveUninitialized: false,
    })
);

app.use(cookieParser());

hbs.registerHelper('eq', function(a, b) {
    return a === b;
});

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context, null, 2);
});

hbs.registerHelper('formatDate', function(date) {
    if (!date) return 'Invalid Date';
    const parsedDate = new Date(date);
    return isNaN(parsedDate) ? 'Invalid Date' : parsedDate.toLocaleDateString();
});

const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect("/login");
    }
};

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.redirect("/profile");
    } else {
        res.sendFile(path.join(__dirname, "login.html"));
    }
});

app.get("/forum", isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, "forum.html"));
});

app.get('/userforum', isAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find().lean();
        res.render('userforum', { userData: req.session.user, posts });
    } catch (err) {
        console.log('Error fetching posts:', err);
        res.status(500).send('Error fetching posts');
    }
});

app.get('/userPosts', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user._id;
        const posts = await Post.find({ user: userId }).sort({ createdAt: -1 }).lean();
        res.json({ success: true, posts });
    } catch (err) {
        console.log('Error fetching user posts:', err);
        res.status(500).json({ success: false, message: 'Error fetching user posts' });
    }
});

app.get("/settings", isAuthenticated, (req, res) => {
    const userData = req.session.user;
    res.render('settings', { userData });
});

app.post("/login", express.urlencoded({ extended: true }), async (req, res) => {
    const user = req.body;
    try {
        const foundUser = await User.findOne(user);
        if (foundUser) {
            req.session.user = foundUser;
            res.cookie("sessionId", req.sessionID);
            res.redirect("/profile");
        } else {
            console.log("User not found!");
            res.redirect("/login");
        }
    } catch (err) {
        console.log("Error!", err);
        res.redirect("/login");
    }
});

app.post("/register", express.urlencoded({ extended: true }), async (req, res) => {
    try {
        if (req.body.password !== req.body['confirm-password']) {
            return res.status(400).send('Passwords do not match');
        }

        const existingUser = await User.findOne({
            $or: [
                { email: req.body.email },
                { username: req.body.username }
            ]
        });

        if (existingUser) {
            return res.status(400).send('Email or username already registered');
        }

        await User.create({ username: req.body.username, email: req.body.email, password: req.body.password });
        res.redirect("/login");
    } catch (err) {
        console.log("Error!", err);
        res.redirect("/register");
    }
});

app.post('/check-username-email', async (req, res) => {
    const { username, email } = req.body;
    const user = await User.findOne({
        $or: [
            { email: email },
            { username: username }
        ]
    });
    if (user) {
        res.json({
            exists: {
                email: user.email === email,
                username: user.username === username
            }
        });
    } else {
        res.json({ exists: false });
    }
});

app.get('/profile', isAuthenticated, async (req, res) => {
    try {
        const userId = req.session.user._id;
        const user = await User.findById(userId).lean();
        const posts = await Post.find({ user: user.username }).sort({ createdAt: -1 }).lean();

        const userData = {
            ...user,
            posts: posts.map(post => ({
                ...post,
                createdAt: new Date(post.createdAt)
            }))
        };

        res.render('profile', { userData });
    } catch (err) {
        console.log('Error fetching user profile:', err);
        res.status(500).send('Error fetching user profile');
    }
});



app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "register.html"));
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("sessionId");
        res.redirect("/");
    });
});

app.get('/api/posts', isAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json({ posts });
    } catch (err) {
        console.log("Error fetching posts!", err);
        res.status(500).json({ error: "Error fetching posts" });
    }
});

app.post("/createPost", isAuthenticated, async (req, res) => {
    const { title, content } = req.body;
    try {
        const newPost = new Post({
            user: req.session.user.username,
            title,
            content,
            comments: [],
            upvotes: 0,
            downvotes: 0,
            voted: null,
            createdAt: new Date()
        });
        await newPost.save();
        res.json(newPost);
    } catch (err) {
        console.log("Error creating post!", err);
        res.status(500).json({ error: "Error creating post" });
    }
});

app.post('/updateProfile', isAuthenticated, async (req, res) => {
    try {
        const updates = {};

        console.log('Received update request:', req.body);

        if (req.files && req.files.profilePicture) {
            const profilePicture = req.files.profilePicture;
            const uploadDir = path.join(__dirname, 'public/uploads');
            
            // Ensure the upload directory exists
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const uploadPath = path.join(uploadDir, profilePicture.name);
            await profilePicture.mv(uploadPath);
            updates.profilePicture = `/public/uploads/${profilePicture.name}`;
        }

        if (req.body.bio) {
            updates.bio = req.body.bio;
        }

        if (req.body.username) {
            updates.username = req.body.username;
        }

        console.log('Updating user with:', updates);

        const updatedUser = await User.findByIdAndUpdate(req.session.user._id, updates, { new: true });

        if (!updatedUser) {
            throw new Error('User not found');
        }

        req.session.user = updatedUser;
        res.json({ success: true });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.json({ success: false, message: err.message });
    }
});

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit the file size to 50MB
    abortOnLimit: true,
    responseOnLimit: 'File size limit has been reached',
}));


app.post('/vote', isAuthenticated, async (req, res) => {
    const { postId, voteType } = req.body;
    const userId = req.session.user._id.toString();

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const currentVote = post.voters.get(userId);

        if (currentVote === voteType) {
            if (voteType === 'upvote') {
                post.upvotes--;
            } else {
                post.downvotes--;
            }
            post.voters.delete(userId);
        } else {
            if (currentVote === 'upvote') {
                post.upvotes--;
            } else if (currentVote === 'downvote') {
                post.downvotes--;
            }

            if (voteType === 'upvote') {
                post.upvotes++;
            } else {
                post.downvotes++;
            }
            post.voters.set(userId, voteType);
        }

        await post.save();
        res.json({ success: true, post });
    } catch (err) {
        console.log('Error voting on post!', err);
        res.status(500).json({ error: 'Error voting on post' });
    }
});

app.post('/api/posts/:postId/comments', isAuthenticated, async (req, res) => {
    const { postId } = req.params;
    const { commentText } = req.body;
    const userId = req.session.user._id;
    const username = req.session.user.username;

    try {
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const newComment = { user: username, text: commentText, createdAt: new Date() };
        post.comments.push(newComment);
        await post.save();

        res.json({ success: true, post });
    } catch (err) {
        console.log('Error adding comment!', err);
        res.status(500).json({ error: 'Error adding comment' });
    }
});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// Delete/edit from db
//
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Edit post/comment
app.post('/edit', async function(req, res) {
    var commentId = req.query.commentId
    var postId = req.query.postId
    var content = req.body.content

    if (commentId) {
        var comment = await Comment.findOne({commentId: commentId})
        await Comment.findOneAndUpdate({ commentId: commentId }, { content: content, edited: 1 })
        res.redirect('/post?postId=' + comment.postId)

    } else if (postId) {
        var post = await Post.findOne({postId: postId})
        await Post.findOneAndUpdate({ postId: postId}, { content: content, edited: 1 })
        res.redirect('/post?postId=' + post.postId)
    }
});

// Delete post/comment
app.get('/delete', async function(req, res) {
    var commentId = req.query.commentId
    var postId = req.query.postId

    if (commentId) {
        var comment = await Comment.findOne({commentId: commentId})
        await Comment.findOneAndUpdate({ commentId: commentId }, { content: '(Comment has been deleted)' })
        res.redirect('/post?postId=' + comment.postId)

    } else if (postId) {
        await Post.findOneAndDelete({ postId: postId})
        await Comment.deleteMany({ postId: postId })
        res.redirect('/home')
    }
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});

const express = require("express");
const session = require("express-session");
const fileUpload = require('express-fileupload');
const cookieParser = require("cookie-parser");
const path = require('path');
const mongoose = require('mongoose');
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
const hbs = require('hbs');
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

app.get("/userforum", isAuthenticated, (req, res) => {
    const userData = req.session.user;
    res.render('userforum', { userData });
});

// Route to settings.hbs
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

app.get("/userforum", isAuthenticated, async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }); // Fetch posts sorted by creation date
        res.render('userforum', { posts, userData: req.session.user });
    } catch (err) {
        console.log("Error fetching posts!", err);
        res.redirect("/");
    }
});


app.get("/profile", isAuthenticated, (req, res) => {
    const userData = req.session.user;
    res.render('profile', { userData });
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
        res.json(newPost); // Return the new post
    } catch (err) {
        console.log("Error creating post!", err);
        res.status(500).json({ error: "Error creating post" });
    }
});


app.post('/updateProfile', isAuthenticated, async (req, res) => {
    try {
        const updates = {};
        
        if (req.files && req.files.profilePicture) {
            const profilePicture = req.files.profilePicture;
            const uploadPath = path.join(__dirname, 'public/uploads', profilePicture.name);
            profilePicture.mv(uploadPath, (err) => {
                if (err) return res.status(500).send(err);
            });
            updates.profilePicture = `/public/uploads/${profilePicture.name}`;
        }

        if (req.body.bio) {
            updates.bio = req.body.bio;
        }

        if (req.body.username) {
            updates.username = req.body.username;
        }

        const updatedUser = await User.findByIdAndUpdate(req.session.user._id, updates, { new: true });

        req.session.user = updatedUser;
        res.json({ success: true });
    } catch (err) {
        res.json({ success: false });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log('Listening to port 3000');
});

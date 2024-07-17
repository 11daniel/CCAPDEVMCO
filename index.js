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
    if (req.session.user) {
        const userData = req.session.user;
        res.render('homepage', { userData });
    } else {
        res.sendFile(path.join(__dirname, "index.html"));
    }
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

// Updated login route with async/await
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

        await User.create({ username: req.body.username, email: req.body.email, password: req.body.password,info: "no Content",image:"null" });
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

app.get("/profile", isAuthenticated, (req, res) => {
    const userData = req.session.user;
    res.render('profile', { userData });
});

app.get("/settings", isAuthenticated, (req, res) => {
    const userData = req.session.user;
    res.render('settings', { userData });
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

const PORT = 3000;
app.listen(PORT, () => {
    console.log('Listening to port 3000');
});

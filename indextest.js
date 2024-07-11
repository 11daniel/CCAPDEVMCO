const express = require("express");
const session = require("express-session");
const fileUpload = require('express-fileupload');
const cookieParser = require("cookie-parser");
const path = require('path');
const mongoose = require('mongoose');
const dbURL = "your_mongo_db_url";

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

app.use('/public', express.static(path.join(__dirname + '/public')));
app.use(express.json());
app.use(fileUpload());

app.use(
    session({
        secret: "secret-key",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(express.static(__dirname + '/public'));
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
        res.sendFile(__dirname + "/index.html");
    }
});

app.get("/login", (req, res) => {
    if (req.session.user) {
        res.redirect("/profile");
    } else {
        res.sendFile(__dirname + "/login.html");
    }
});

app.get("/forum", isAuthenticated, (req, res) => {
    res.sendFile(__dirname + "/forum.html");
});

app.post("/login", express.urlencoded({ extended: true }), (req, res) => {
    const user = req.body;
    User.findOne(user, function(err, user) {
        if (err) {
            console.log("Error!");
        } else {
            req.session.user = user;
            res.cookie("sessionId", req.sessionID);
            res.redirect("/profile");
        }
    });
});

app.post("/register", express.urlencoded({ extended: true }), (req, res) => {
    let avatarPath = null;
    if (req.files && req.files.avatar) {
        const avatar = req.files.avatar;
        avatarPath = '/public/uploads/' + avatar.name;
        avatar.mv(__dirname + avatarPath, function(err) {
            if (err) {
                console.log('Error uploading avatar:', err);
                return res.status(500).send(err);
            }
        });
    }

    const newUser = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        image: avatarPath
    };

    User.create(newUser, (err, user) => {
        if (err) {
            console.log('Error creating user:', err);
            res.redirect("/register");
        } else {
            req.session.user = user;
            res.redirect("/profile");
        }
    });
});

app.get("/profile", isAuthenticated, (req, res) => {
    const userData = req.session.user;
    console.log(userData);
    res.render('profile', { userData });
});

app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/register.html");
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

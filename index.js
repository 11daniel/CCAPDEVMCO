const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const path = require('path');
const hbs = require('hbs');

const app = express();

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(
    session({
        secret: "secret-key",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(cookieParser());

let user3 = null;

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
    res.render('forum', {
        posts: [
            { title: "First Post", content: "This is the content of the first post." },
            { title: "Second Post", content: "This is the content of the second post." }
        ]
    });
});

app.post("/login", express.urlencoded({ extended: true }), (req, res) => {
    const { email, password } = req.body;

    if (email === "admin@gmail.com" && password === "admin") {
        req.session.user = { username: "Admin", email: "admin@gmail.com", profilePicture: "/public/images/admin.jpg", bio: "Admin user", joinDate: "January 1, 2020", posts: [], comments: [] };
        res.cookie("sessionId", req.sessionID);
        res.redirect("/profile");
    } else if (email === "charlie@gmail.com" && password === "charlie") {
        req.session.user = { username: "Charlie", email: "charlie@gmail.com", profilePicture: "/public/images/charlie.jpg", bio: "Developer", joinDate: "February 10, 2020", posts: [], comments: [] };
        res.cookie("sessionId", req.sessionID);
        res.redirect("/profile");
    } else if (user3 && email === user3.email && password === user3.password) {
        req.session.user = user3;
        res.cookie("sessionId", req.sessionID);
        res.redirect("/profile");
    } else {
        res.send("Error User Not Found");
    }
});

app.post("/register", express.urlencoded({ extended: true }), (req, res) => {
    const { username, email, password } = req.body;
    user3 = { username, email, password, profilePicture: "/public/images/default.jpg", bio: "", joinDate: new Date().toDateString(), posts: [], comments: [] };
    res.redirect("/login");
});

app.get("/profile", isAuthenticated, (req, res) => {
    const userData = req.session.user;
    res.render('profile', { userData });
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "register.html"));
});

app.get("/settings", isAuthenticated, (req, res) => {
    const userData = req.session.user;
    res.render('settings', { userData });
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => {
        res.clearCookie("sessionId");
        res.redirect("/login");
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

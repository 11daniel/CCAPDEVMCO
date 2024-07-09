const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
 
const app = express();
const hbs = require('hbs');
app.set('view engine','hbs');

app.use(
    session({
        secret: "secret-key",
        resave: false,
        saveUninitialized: false,
    })
);
app.use(express.static(__dirname + '/public'));
const user1 = {
    username: "Art",
    password: "Hello! I'm Art!",
    email: "art@art.com"
}; 

const user2 = {
    username: "Charlie",
    password: "Arf! Arf! Woof! Woof!",
    email: "charlie@charlie.com"
}; 
const user3 = {}
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
        res.render('homepage',{userData});
    }
    else{
        res.sendFile(__dirname + "/index.html");
    }
});
 
app.get("/login", (req, res) => {
    if (req.session.user) {
        res.redirect("/profile");
    }
    else{
    res.sendFile(__dirname + "/login.html");
    }
});

app.get("/forum", isAuthenticated, (req,res) => {
    res.sendFile(__dirname + "/forum.html");
});

app.post("/login", express.urlencoded({ extended: true }), (req, res) => {
    const { email, password } = req.body;
 
    // Check if the provided credentials are valid (for MCO2)
    if (email === "admin@gmail.com" && password === "admin") {
        // Store user data in the session
        req.session.user = user1;
        res.cookie("sessionId", req.sessionID);
 
        res.redirect("/profile");
    }
    else if (email === "charlie@gmail.com" && password === "charlie") {
        // Store user data in the session
        req.session.user = user2;
        res.cookie("sessionId", req.sessionID);
 
        res.redirect("/profile");
    }
    else if (user3 !== null && email === user3.username && password === user3.password) {
        // Store user data in the session
        req.session.user = user3;
        res.cookie("sessionId", req.sessionID);
 
        res.redirect("/profile");
    }
     else {
        res.send("Error User Not Found")
    }
});
app.post("/register", express.urlencoded({ extended: true }), (req, res) => {
    const {username, email, password } = req.body;
    // Temporary Storage of Users for MCO2 (will use mongodb in the future)
    user3.username = username;
    user3.email = email;
    user3.password = password;
    res.redirect("/login");
});
app.get("/profile", isAuthenticated, (req, res) => {
    // Retrieve user data from the session
    const userData = req.session.user;
    console.log(userData);
    res.render('profile',{userData});
});
app.get("/register", (req, res) =>{
    res.sendFile(__dirname + "/register.html");
});

app.get("/logout", (req, res) => {
    // Destroy the session and redirect to the login page
    req.session.destroy(() => {
        res.clearCookie("sessionId");
        res.redirect("/");
    });
});
 
// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log('Listening to port 3000');
});
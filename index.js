const express = require("express");
const session = require("express-session");
const fileUpload = require('express-fileupload')
const cookieParser = require("cookie-parser");
const path = require('path');
const mongoose = require('mongoose')
const dbURL = "mongodb+srv://admin:foiTTXlNEKLaJBwL@ccapdev.ifalvu3.mongodb.net/?retryWrites=true&w=majority&appName=ccapdev"

mongoose.connect(dbURL).then(()=>{
    console.info('Connected to App Demo Data Base');
})
.catch((e) => {
    console.log('Error Connecting to App Demo Data Base');
});
const Post = require("./models/POST");
const User = require("./models/USER");
const app = express();
app.use(express.urlencoded( {extended: true}));
const hbs = require('hbs');
app.set('view engine','hbs');

//app.use(express.static(__dirname + '/public'));
app.use('/public', express.static(path.join(__dirname + '/public')));
app.use(express.json()) 

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
    const user = req.body;
    User.findOne(user, function(err,user){
        if (err){console.log ("Error!")}
        else {
            req.session.user = user;
            res.cookie("sessionId", req.sessionID);
            res.redirect("/profile");
        }
    });
});
app.post("/register", express.urlencoded({ extended: true }), (req, res) => {
    User.create({...req.body,image:null});
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
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
    name: "Art",
    quote: "Hello! I'm Art!"
}; 

const user2 = {
    name: "Charlie",
    quote: "Arf! Arf! Woof! Woof!"
}; 

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
 
    // Check if the provided credentials are valid
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
     else {
        res.status(401).send('Invalid credentials');
        res.redirect("/login");
    }
});
 
app.get("/profile", isAuthenticated, (req, res) => {
    // Retrieve user data from the session
    const userData = req.session.user;
    console.log(userData);
    res.render('profile',{userData});
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
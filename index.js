var express = require('express'); 
const path = require('path');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false}));

app.use('/css', express.static(path.join(__dirname + '/css')));

app.get('/', (req,res) =>
{
    res.sendFile(__dirname + '\\' + 'index.html');
});

app.get('/forum', (req,res) =>
{
    res.sendFile(path.join(__dirname, 'forum.html'));
});

app.get('/register', (req,res) =>
{
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.get('/login', (req,res) =>
{
    res.sendFile(path.join(__dirname, 'login.html'));
});

var server = app.listen(5000, function()
{
    console.log("Listening at port 5000");
});
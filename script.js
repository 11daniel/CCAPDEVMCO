const handlebars = require('handlebars');
const fs = require('fs');

var express = require('express'); 
const path = require('path');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false}));

// Read the Handlebars file
fs.readFile('index.handlebars', 'utf-8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Compile the Handlebars template
  const template = handlebars.compile(data);

  // Define the data to be passed to the template
  const context = {
    pageTitle: 'Peaky Coders',
    currentYear: new Date().getFullYear()
    // Add more dynamic data as needed
  };

  // Pass the data to the template and log the result
  const result = template(context);
  console.log(result);
});

var server = app.listen(5000, function()
{
    console.log("Listening at port 5000");
});
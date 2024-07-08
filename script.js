const handlebars = require('handlebars');
const fs = require('fs');

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
    pageTitle: 'Your Page Title',
    currentYear: new Date().getFullYear()
    // Add more dynamic data as needed
  };

  // Pass the data to the template and log the result
  const result = template(context);
  console.log(result);
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log('Listening to port 3000');
});
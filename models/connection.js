const mongoose = require('mongoose');
const { dbURL } = require('../config');

const options = { useNewUrlParser: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
};
try{
    mongoose.connect(dbURL)
    console.log("Connected to PEAKYDB");
}catch(err){
    console.log("ERROR CONNECTING TO PEAKYDB: ");
    }
const mongoose = require('mongoose');
const { dbURL } = require('../config');

const options = { useNewUrlParser: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

const connectDB = async() => {
    try{
        await mongoose.connect(dbURL,options)
        console.log("Connected to Coders DB");
    } catch(error){
        console.log("Failed to Connect to Coders DB :(")
    }
}
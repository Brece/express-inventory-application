const mongoose = require('mongoose');

const dev_db_url = 'mongodb+srv://user:user123@cluster0.ayay7nr.mongodb.net/inventory_application?retryWrites=true&w=majority';
const mongoDB = process.env.MONGODB_URI || dev_db_url;

const connectDB = async() => {
    try {
        const connection = await mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });

        console.log(`MongoDB connected: ${connection.connection.host}`);
    } catch(err) {
        console.log(err);
        process.exit(1);
    }
}

module.exports = connectDB;

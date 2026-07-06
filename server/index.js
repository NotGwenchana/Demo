const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');


const dns = require('dns'); //set dns manually to avoid dns resolution issues in some environments
dns.setServers(['8.8.8.8', '1.1.1.1']);

const app = express();

//middleware
app.use(express.json());
app.use(cookieParser()); //
app.use(express.urlencoded({ extended: false })); //

app.use('/', require('./routes/authRoutes'));

const port = 8000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || process.env.MONGO_URl;
if (!mongoUri) {
  console.error('Missing MongoDB connection string (MONGODB_URI or MONGO_URL)');
} else {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log('Database connected successfully');
    })
    .catch((err) => {
      console.error('Error connecting to MongoDB:', err);
    });
}




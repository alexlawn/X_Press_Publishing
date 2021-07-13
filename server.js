const cors = require('cors');
const errorHandler = require('errorhandler');
const morgan = require('morgan');
const express = require('express');

const app = express();
const apiRouter = require('./api/api');
const PORT = process.env.PORT || 4000;

// Middleware
// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
// Cross-Origin Resource Sharing
app.use(cors());
app.use('/api', apiRouter);
app.use(errorHandler());
//Logging middleware. Allows for easier debugging
app.use(morgan('dev'));





// Code to start the server listening at the PORT below
app.listen(PORT, () => {
    console.log(`Server is listening on ${PORT}`);
  });
   
  module.exports = app;
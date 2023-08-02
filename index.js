const express = require("express");
const session = require('express-session');
const mongoose = require('mongoose');
const dotenv = require("dotenv").config();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const adminRoute = require('./routes/adminRoute');
const nocache = require('nocache')

const app = express();

// mongodb connection
const database = process.env.MONGOLAB_URI;
mongoose
  .connect(database, { useUnifiedTopology: true, useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log(err));

// view engine
app.set('view engine', 'ejs');

app.use(session({
  secret: 'key',
  cookie: { maxAge: 6000000 },
  resave: true,
  saveUninitialized: true,
}));

// body parsing
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.use(express.static('public'));

// cookie
app.use(cookieParser());

// routes
app.use('/', require('./routes/login'));

// admin route
app.use('/admin', adminRoute);
app.use(nocache())

const errorRoutes = require('./routes/errorRoutes');
app.use(errorRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log("Server is running on port: " + PORT));

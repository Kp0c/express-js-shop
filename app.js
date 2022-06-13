const path = require('path');
const express = require("express");
const bodyParser = require("body-parser")
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');

const User = require("./models/user");
const emailSender = require("./util/email-sender");

require('dotenv').config();

const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGODB_URL,
  collection: 'sessions',
},);
emailSender.createTransporter();

const csrfProtection = csrf();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
}));
app.use(csrfProtection);
app.use(flash());

app.use(async (req, res, next) => {
  if (req.session.userId) {
    req.user = await User.findById(req.session.userId);
  }
  next();
});

app.use((req, res, next) => {
  res.locals = {
    isAuthenticated: !!req.session.userId,
    csrfToken: req.csrfToken(),
  }

  next();
});

app.use('/admin', adminRoutes);
app.use(authRoutes);
app.use(shopRoutes);

app.use(errorController.notFoundController);

(async () => {
  await mongoose.connect(process.env.MONGODB_URL);

  app.listen(3000);
})();

const path = require('path');
const express = require("express");
const bodyParser = require("body-parser")
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const fs = require('fs');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');

const User = require("./models/user");
const emailSender = require("./util/email-sender");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

require('dotenv').config();

const app = express();

const store = new MongoDBStore({
  uri: process.env.MONGODB_URL,
  collection: 'sessions',
},);
emailSender.createTransporter();

const csrfProtection = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'data/images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '.') + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'logs', 'access.log'), { flags: 'a' });

app.set('view engine', 'ejs');

app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter }).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data/images', express.static(path.join(__dirname, 'data/images')));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
}));
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals = {
    isAuthenticated: !!req.session.userId,
    csrfToken: req.csrfToken(),
  }

  next();
});

app.use(async (req, res, next) => {
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId);
      if (user) {
        req.user = user;
      }
    } catch (err) {
      return next(err);
    }
  }
  next();
});

app.use('/admin', adminRoutes);
app.use(authRoutes);
app.use(shopRoutes);

app.use(errorController.notFoundController);

app.use((error, req, res, _) => {
  console.error(error);

  res.status(500).render('500', {
    title: 'Error occurred',
    path: null
  });
});

(async () => {
  await mongoose.connect(process.env.MONGODB_URL);

  app.listen(process.env.PORT || 3000);
})();

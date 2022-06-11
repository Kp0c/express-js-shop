const path = require('path');
const express = require("express");
const bodyParser = require("body-parser");

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');

const mongoose = require('mongoose');

const User = require("./models/user");

require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  req.user = await User.findById('62a45b086591990a7263fa8d');

  next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.notFoundController);

(async () => {
  await mongoose.connect(process.env.MONGODB_URL);

  app.listen(3000);
})();

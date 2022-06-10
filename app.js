const path = require('path');
const express = require("express");
const bodyParser = require("body-parser");

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/error');

const { mongoConnect } = require('./util/database');
const User = require("./models/user");

require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  const user = await User.findById('62a3230758bccf386ada7f54');

  req.user = new User({
    id: user._id,
    name: user.name,
    email: user.email,
    cart: user.cart
  });

  next();
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.notFoundController);

(async () => {
  await mongoConnect();

  app.listen(3000);
})();

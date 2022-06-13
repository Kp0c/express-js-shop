const bcrypt = require('bcryptjs');
const emailSender = require("../util/email-sender");

const User = require("../models/user");

exports.getLogin = (req, res) => {
  let messages = req.flash('error');
  let errorMessage = messages.join('<br>');

  res.render('auth/login', {
    title: 'Login',
    path: '/login',
    errorMessage
  });
}

exports.postLogin = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    req.flash('error', 'Invalid email or password');
    await req.session.save();
    return res.redirect('/login');
  }

  const isPasswordValid = await bcrypt.compare(req.body.password, user.password);

  if (!isPasswordValid) {
    req.flash('error', 'Invalid email or password');
    await req.session.save();
    return res.redirect('/login');
  }

  req.session.userId = user._id;
  await req.session.save();

  res.redirect('/');
}

exports.getSignup = (req, res) => {
  let messages = req.flash('error');
  let errorMessage = messages.join('<br>');

  res.render('auth/signup', {
    title: 'signup',
    path: '/signup',
    errorMessage
  });
}

exports.postSignup = async (req, res) => {
  const existingUser = await User.findOne({ email: req.body.email })

  if (existingUser) {
    req.flash('error', 'User already exists');
    await req.session.save();
    return res.redirect('/signup');
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 12)

  const user = new User({
    email: req.body.email,
    password: hashedPassword,
    cart: { items: [] }
  });

  await user.save();

  await emailSender.sendEmail(user.email,
    'Welcome to our store',
    '<p>You have successfully signed up!</p>'
  );

  req.session.userId = user._id;
  await req.session.save();

  res.redirect('/');
}

exports.postLogout = async (req, res) => {
  await req.session.destroy();

  res.redirect('/');
}

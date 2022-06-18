const bcrypt = require('bcryptjs');
const emailSender = require("../util/email-sender");
const crypto = require('crypto');
const { validationResult } = require('express-validator');

const User = require("../models/user");

exports.getLogin = (req, res) => {
  const messages = req.flash('error');
  const errorMessage = messages.join('. ');

  res.render('auth/login', {
    title: 'Login',
    path: '/login',
    errorMessage,
    oldInput: null,
    validationErrors: []
  });
}

exports.postLogin = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => error.msg);
    const errorMessage = formattedErrors.join('. ');

    return res.status(422).render('auth/login', {
      title: 'Login',
      path: '/login',
      errorMessage,
      oldInput: {
        email: req.body.email,
        password: req.body.password
      },
      validationErrors: errors.array().map(error => error.param)
    });
  }

  try {
    const user = await User.findOne({ email: req.body.email });

    req.session.userId = user._id;
    await req.session.save();

    res.redirect('/');
  } catch (err) {
    return next(err);
  }
}

exports.getSignup = (req, res) => {
  let messages = req.flash('error');
  let errorMessage = messages.join('. ');

  res.render('auth/signup', {
    title: 'signup',
    path: '/signup',
    errorMessage,
    oldInput: null,
    validationErrors: []
  });
}

exports.postSignup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => error.msg);
    const errorMessage = formattedErrors.join('. ');

    return res.status(422).render('auth/signup', {
      title: 'signup',
      path: '/signup',
      errorMessage: errorMessage,
      oldInput: {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword
      },
      validationErrors: errors.array().map(error => error.param)
    });
  }

  try {
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
  } catch (err) {
    return next(err);
  }
}

exports.postLogout = async (req, res, next) => {
  try {
    await req.session.destroy();

    res.redirect('/');
  } catch (err) {
    return next(err);
  }
}

exports.getReset = (req, res) => {
  const messages = req.flash('error');
  const errorMessage = messages.join('. ');

  res.render('auth/reset', {
    title: 'Reset Password',
    path: '/reset',
    errorMessage
  });
}

exports.postReset = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      req.flash('error', 'User not found');
      await req.session.save();
      res.redirect('/reset');
      return;
    }

    user.resetToken = crypto.randomBytes(32).toString('hex');
    user.resetTokenExpiration = Date.now() + 3_600_000; // 1 hour from now

    await user.save();

    await emailSender.sendEmail(
      user.email,
      'Reset your password',
      `<p>You have requested a password reset. Click the link below to reset your password:</p>
    <a href="${req.headers.origin}/reset/${user.resetToken}">Reset Password</a>
    <p>This link will expire in 1 hour.</p>`
    );

    res.redirect('/login');
  } catch (err) {
    return next(err);
  }
}

exports.getNewPassword = async (req, res) => {
  const errors = req.flash('error');
  const errorMessage = errors.join('. ');

  res.render('auth/new-password', {
    title: 'New Password',
    path: '/new-password',
    token: req.params.token,
    errorMessage
  });
}

exports.postNewPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({
      resetToken: req.body.token,
      resetTokenExpiration: {$gt: Date.now()}
    });

    if (!user) {
      req.flash('error', 'Invalid token');
      await req.session.save();
      res.redirect('/reset');
      return;
    }

    if (req.body.password !== req.body.confirmPassword) {
      req.flash('error', 'Passwords do not match');
      await req.session.save();
    }

    user.password = await bcrypt.hash(req.body.password, 12);
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();

    req.session.userId = user._id;
    await req.session.save();

    res.redirect('/');
  } catch (err) {
    return next(err);
  }
}

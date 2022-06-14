const express = require('express');
const bcrypt = require('bcryptjs');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require("../models/user");

const passwordValidator = body(
  'password',
  'Password must be only numbers and text between 4 and 20 characters'
)
  .isLength({min: 4, max: 20})
  .trim()

const emailValidator = check('email')
  .isEmail()
  .withMessage('Please enter a valid email address')
  .normalizeEmail();

const router = express.Router();

router.get('/login', authController.getLogin);

router.post('/login',
  [
    emailValidator,
    passwordValidator,
    body('email')
      .custom((value, { req }) => {
        return User.findOne({ email: value })
          .then(userDoc => {
            if (!userDoc) {
              return Promise.reject('Email is not registered');
            }

            return bcrypt.compare(req.body.password, userDoc.password).then(isEqual => {
              if (!isEqual) {
                return Promise.reject('Password is incorrect');
              }

              return true;
            });
          });
      })
  ],
  authController.postLogin
);

router.get('/signup', authController.getSignup);

router.post('/signup',
  [
    emailValidator,
    check('email')
      .custom((value, {}) => {
        return User.findOne({email: value}).then(userDoc => {
          if (userDoc) {
            return Promise.reject('Email address already exists');
          }
        });
      }),
    passwordValidator,
    check('confirmPassword')
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;

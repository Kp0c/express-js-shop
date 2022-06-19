const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');
const {body} = require("express-validator");

const router = express.Router();

router.use(isAuth);

router.get('/add-product', adminController.getAddProduct);

const productValidators = [
  body('title', 'Please enter a title')
    .isLength({min: 3, max: 200})
    .trim(),
  body('price', 'Please enter a price')
    .isNumeric(),
  body('description', 'Please enter a description')
    .isLength({min: 5, max: 4000})
    .trim()
];
router.post('/add-product',
  productValidators,
  adminController.postAddProduct
);

router.get('/products', adminController.getProducts);

router.get('/edit-product/:productId', adminController.getEditProduct);

router.post('/edit-product',
  productValidators,
  adminController.postEditProduct
);

router.delete('/products/:productId', adminController.deleteProduct);

module.exports = router;

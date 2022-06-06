const Product = require('../models/product');
const Cart = require("../models/cart");

exports.getProducts = (req, res) => {
  Product.fetchAll((products) => {
    res.render('shop/product-list', { products, title: 'All Products', path: '/products' });
  });
};

exports.getProduct = (req, res) => {
  const productId = Number(req.params['productId']);
  Product.findById(productId, (product) => {
    console.log(product);
    res.render('shop/product-detail', { product, title: product.title, path: '/products' });
  });
};

exports.getIndex = (req, res) => {
  Product.fetchAll((products) => {
    res.render('shop/index', { products, title: 'Shop', path: '/' });
  });
}

exports.getCart = (req, res) => {
  res.render('shop/cart', { title: 'Your Cart', path: '/cart' });
}

exports.postCart = (req, res) => {
  const productId = Number(req.body['productId']);

  Product.findById(productId, (product) => {
    Cart.addProduct(productId, product.price);
  });

  res.redirect('/cart');
}

exports.getOrders = (req, res) => {
  res.render('shop/orders', { title: 'Your Orders', path: '/orders' });
}

exports.getCheckout = (req, res) => {
  res.render('shop/checkout', { title: 'Checkout', path: '/checkout' });
}

const Product = require('../models/product');
// const Cart = require("../models/cart");
// const OrderItem = require("../models/order-item");

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();

    res.render('shop/product-list', { products, title: 'All Products', path: '/products' });
  } catch(err) {
    console.error(err);
  }
};

exports.getProduct = async (req, res) => {
  const productId = req.params['productId'];
  const product = await Product.findById(productId);

  if (!product) {
    console.error('Product not found', productId);
    return res.redirect('/');
  }

  res.render('shop/product-detail', { product, title: product.title, path: '/products' });
};

exports.getIndex = async (req, res) => {
  try {
    const products = await Product.find();

    res.render('shop/index', { products, title: 'Shop', path: '/' });
  } catch(err) {
    console.error(err);
  }
}

exports.getCart = async (req, res) => {
  const items = await req.user.getCartItems();

  res.render('shop/cart', { cartProducts: items, title: 'Your Cart', path: '/cart' });
}

exports.postCart = async (req, res) => {
  const productId = req.body['productId'];

  const product = await Product.findById(productId);

  if (!product) {
    console.error('Product not found', productId);
    return res.redirect('/');
  }

  await req.user.addToCart(product);

  res.redirect('/cart');
}

exports.postCartDeleteProduct = async (req, res) => {
  const productId = req.body['productId'];

  await req.user.deleteFromCart(productId);

  res.redirect('/cart');
}

exports.postCreateOrder = async (req, res) => {
  await req.user.addOrder();

  res.redirect('/orders');
}

exports.getOrders = async (req, res) => {
  const orders = await req.user.getOrders();

  res.render('shop/orders', { orders, title: 'Your Orders', path: '/orders' });
}

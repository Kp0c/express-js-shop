const Product = require('../models/product');
const Cart = require("../models/cart");

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();

    res.render('shop/product-list', { products, title: 'All Products', path: '/products' });
  } catch(err) {
    console.error(err);
  }
};

exports.getProduct = async (req, res) => {
  const productId = req.params['productId'];
  const product = await Product.findByPk(productId);

  if (!product) {
    console.error('Product not found', productId);
    return res.redirect('/');
  }

  res.render('shop/product-detail', { product, title: product.title, path: '/products' });
};

exports.getIndex = async (req, res) => {
  try {
    const products = await Product.findAll();

    res.render('shop/index', { products, title: 'Shop', path: '/' });
  } catch(err) {
    console.error(err);
  }
}

exports.getCart = async (req, res) => {
  const cart = await req.user.getCart({
    include: [{ model: Product }]
  });

  res.render('shop/cart', { cartProducts: cart.products, title: 'Your Cart', path: '/cart' });
}

exports.postCart = async (req, res) => {
  const productId = req.body['productId'];

  const cart = await req.user.getCart();

  const products = await cart.getProducts({
    where: {
      id: productId
    }
  });

  const newQuantity = products.length > 0
    ? products[0].cartItem.quantity + 1
    : 1;

  const product = await Product.findByPk(productId);
  await cart.addProduct(product, {
    through: {
      quantity: newQuantity,
    }
  });

  res.redirect('/cart');
}

exports.postCartDeleteProduct = async (req, res) => {
  const productId = req.body['productId'];

  const cart = await req.user.getCart();

  const [product] = await cart.getProducts({
    where: {
      id: productId
    }
  });

  product.cartItem.destroy();

  res.redirect('/cart');
}

exports.getOrders = (req, res) => {
  res.render('shop/orders', { title: 'Your Orders', path: '/orders' });
}

exports.getCheckout = (req, res) => {
  res.render('shop/checkout', { title: 'Checkout', path: '/checkout' });
}

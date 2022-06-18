const Product = require('../models/product');

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.render('shop/product-list', {
      products,
      title: 'All Products',
      path: '/products'
    });
  } catch(err) {
    return next(err);
  }
};

exports.getProduct = async (req, res, next) => {
  try {
    const productId = req.params['productId'];
    const product = await Product.findById(productId);

    if (!product) {
      console.error('Product not found', productId);
      return res.redirect('/');
    }

    res.render('shop/product-detail', {
      product,
      title: product.title,
      path: '/products'
    });
  } catch(err) {
    return next(err);
  }
};

exports.getIndex = async (req, res, next) => {
  try {
    const products = await Product.find();

    res.render('shop/index', {
      products,
      title: 'Shop',
      path: '/'
    });
  } catch(err) {
    return next(err);
  }
}

exports.getCart = async (req, res, next) => {
  try {
    const items = await req.user.getCartItems();

    res.render('shop/cart', {
      cartProducts: items,
      title: 'Your Cart',
      path: '/cart'
    });
  } catch(err) {
    return next(err);
  }
}

exports.postCart = async (req, res, next) => {
  try {
    const productId = req.body['productId'];

    const product = await Product.findById(productId);

    if (!product) {
      console.error('Product not found', productId);
      return res.redirect('/');
    }

    await req.user.addToCart(product);

    res.redirect('/cart');
  } catch(err) {
    return next(err);
  }
}

exports.postCartDeleteProduct = async (req, res, next) => {
  try {
    const productId = req.body['productId'];

    await req.user.deleteFromCart(productId);

    res.redirect('/cart');
  } catch(err) {
    return next(err);
  }
}

exports.postCreateOrder = async (req, res, next) => {
  try {
    await req.user.addOrder();

    res.redirect('/orders');
  } catch(err) {
    return next(err);
  }
}

exports.getOrders = async (req, res, next) => {
  try {
    const orders = await req.user.getOrders();

    res.render('shop/orders', {
      orders,
      title: 'Your Orders',
      path: '/orders'
    });
  } catch(err) {
    return next(err);
  }
}

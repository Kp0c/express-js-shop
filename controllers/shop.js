const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require("pdfkit");

require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const ITEMS_PER_PAGE = 4;

exports.getProducts = async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);

    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    const totalItems = await Product.countDocuments();

    res.render('shop/product-list', {
      products,
      title: 'All Products',
      path: '/products',
      pages: Math.ceil(totalItems / ITEMS_PER_PAGE),
      currentPage: page
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
    const page = Number(req.query.page || 1);

    const products = await Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    const totalItems = await Product.countDocuments();

    res.render('shop/index', {
      products,
      title: 'Shop',
      path: '/',
      pages: Math.ceil(totalItems / ITEMS_PER_PAGE),
      currentPage: page
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

exports.getInvoice = async (req, res, next) => {
  try {
    const orderId = req.params['orderId'];

    const order = await Order.findById(orderId);

    if (!order) {
      console.error('Order not found', orderId);
      return res.redirect('/');
    }

    if (!order.user.equals(req.user._id)) {
      console.error('User not authorized to see this order');
      return res.redirect('/');
    }

    const invoiceName = 'invoice-' + orderId + '.pdf';
    const invoicePath = path.join('data', 'invoices', invoiceName);

    const pdfDoc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');

    pdfDoc.pipe(fs.createWriteStream(invoicePath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text('Invoice', {
      underline: true
    });
    pdfDoc.text('--------------------');
    pdfDoc.fontSize(14).text(`Order Number: ${orderId}`);
    let totalSum = 0;
    order.items.forEach(item => {
      pdfDoc.text(`${item.title} - ${item.quantity} x $${item.price}`);
      totalSum += item.quantity * item.price;
    });

    pdfDoc.text('--------------------');
    pdfDoc.text(`Total: $${totalSum}`);

    pdfDoc.end();
  } catch (err) {
    return next(err);
  }
}

exports.getCheckout = async (req, res, next) => {
  try {
    const items = await req.user.getCartItems();

    const totalSum = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map(item => ({
        name: item.title,
        description: item.description,
        amount: item.price * 100,
        currency: 'usd',
        quantity: item.quantity
      })),
      success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
      cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
    });

    res.render('shop/checkout', {
      title: 'Checkout',
      path: '/checkout',
      items,
      totalSum,
      sessionId: session.id,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (err) {
    return next(err);
  }
}

// Note: we cannot rely on this because user can call it via browser without paying
// We need to use webhooks to make sure that user paid. See https://stripe.com/docs/payments/checkout/fulfill-orders
exports.getCheckoutSuccess = async (req, res, next) => {
  try {
    await req.user.addOrder();

    res.redirect('/orders');
  } catch (err) {
    return next(err);
  }
}

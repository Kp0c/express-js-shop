const Product = require('../models/product');
const Order = require('../models/order');
const fs = require('fs');
const path = require('path');
const PDFDocument = require("pdfkit");

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

const Product = require('../models/product');
const {validationResult} = require("express-validator");
const { deleteFile } = require('../util/file');

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    title: 'Add Product',
    path: '/admin/add-product',
    product: null,
    errorMessage: null,
    validationErrors: []
  });
};

exports.postAddProduct = async (req, res, next) => {
  const image = req.file;

  const errors = validationResult(req);
  if (!errors.isEmpty() || !image) {
    const formattedErrors = errors.array().map(error => error.msg);
    const errorMessage = formattedErrors.join('. ') || 'No image provided';
    const validationErrors = errors.array().map(error => error.param);

    if (!image) {
      validationErrors.push('image');
    }

    return res.status(422).render('admin/edit-product', {
      title: 'Add Product',
      path: '/admin/add-product',
      product: {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price
      },
      errorMessage,
      validationErrors
    });
  }

  try {
    const product = new Product({
      title: req.body.title,
      imageUrl: image.path,
      description: req.body.description,
      price: req.body.price,
      userId: req.user,
    });

    await product.save();
  } catch (err) {
    return next(err);
  }

  res.redirect('/admin/products');
};

exports.getEditProduct = async (req, res, next) => {
  const productId = req.params['productId'];
  try {
    const product = await Product.findById(productId);

    if (!product) {
      console.error('Product not found', productId);
      return res.redirect('/');
    }

    res.render('admin/edit-product', {
      title: 'Edit Product',
      path: '/admin/edit-product',
      product,
      errorMessage: null,
      validationErrors: []
    });
  } catch (err) {
    return next(err);
  }
};

exports.postEditProduct = async (req, res, next) => {
  const errors = validationResult(req);
  const image = req.file;

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => error.msg);
    const errorMessage = formattedErrors.join('. ');

    return res.status(422).render('admin/edit-product', {
      title: 'Edit Product',
      path: '/admin/edit-product',
      product: {
        _id: req.body.productId,
        title: req.body.title,
        description: req.body.description,
        price: req.body.price
      },
      errorMessage,
      validationErrors: errors.array().map(error => error.param)
    });
  }

  const productId = req.body['productId'];

  try {
    const product = await Product.findById(productId);

    if (!product) {
      console.error('Product not found', productId);
      return res.redirect('/');
    }

    if (!product.userId.equals(req.user._id)) {
      console.error('User not authorized to edit this product');
      return res.redirect('/');
    }

    product.title = req.body.title;
    if (image) {
      deleteFile(product.imageUrl).catch(err => console.error(err));
      product.imageUrl = image.path;
    }
    product.description = req.body.description;
    product.price = req.body.price;

    await product.save();

    res.redirect('/admin/products');
  } catch (err) {
    return next(err);
  }
}

exports.getProducts = async (req, res, next) => {
  try {
    const products = await Product.find({
      userId: req.user._id
    });
    res.render('admin/products', {
      products,
      title: 'Admin Products',
      path: '/admin/products'
    });
  } catch (err) {
    return next(err);
  }
}

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params['productId'];

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    deleteFile(product.imageUrl).catch(err => console.error(err));

    await Product.deleteOne({ _id: productId, userId: req.user._id });

    res.status(200).json({
      success: true,
      productId
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: 'Server error'
    });
  }
}

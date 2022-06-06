const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', { title: 'Add Product', path: '/admin/add-product', product: null });
};

exports.postAddProduct = (req, res) => {
  const product = new Product({
    title: req.body.title,
    imageUrl: req.body.imageUrl,
    description: req.body.description,
    price: req.body.price
  });
  product.save();

  res.redirect('/');
};

exports.getEditProduct = (req, res) => {
  const productId = req.params['productId'];

  Product.findById(productId, (product) => {
    res.render('admin/edit-product', {
      title: 'Edit Product',
      path: '/admin/edit-product',
      product
    });
  });
};

exports.postEditProduct = (req, res) => {
  const product = new Product({
    id: req.body['productId'],
    title: req.body.title,
    imageUrl: req.body.imageUrl,
    description: req.body.description,
    price: req.body.price
  });

  product.save();

  res.redirect('/admin/products');
}

exports.getProducts = (req, res) => {
  Product.fetchAll((products) => {
    res.render('admin/products', { products, title: 'Admin Products', path: '/admin/products' });
  });
}

exports.postDeleteProduct = (req, res) => {
  const productId = req.body['productId'];

  Product.deleteById(productId);

  res.redirect('/admin/products');
}

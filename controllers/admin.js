const Product = require('../models/product');

exports.getAddProduct = (req, res) => {
  res.render('admin/edit-product', { title: 'Add Product', path: '/admin/add-product', product: null });
};

exports.postAddProduct = async (req, res) => {
  try {
    const product = new Product({
      title: req.body.title,
      imageUrl: req.body.imageUrl,
      description: req.body.description,
      price: req.body.price,
      userId: req.user,
    });

    await product.save();
  } catch (err) {
    console.error(err);
  }

  res.redirect('/admin/products');
};

exports.getEditProduct = async (req, res) => {
  const productId = req.params['productId'];
  const product = await Product.findById(productId);

  if (!product) {
    console.error('Product not found', productId);
    return res.redirect('/');
  }

  res.render('admin/edit-product', {
    title: 'Edit Product',
    path: '/admin/edit-product',
    product
  });
};

exports.postEditProduct = async (req, res) => {
  const productId = req.body['productId'];

  const product = await Product.findById(productId);

  product.title = req.body.title;
  product.imageUrl = req.body.imageUrl;
  product.description = req.body.description;
  product.price = req.body.price;

  await product.save();

  res.redirect('/admin/products');
}

exports.getProducts = async (req, res) => {
  const products = await Product.find();
  res.render('admin/products', { products, title: 'Admin Products', path: '/admin/products' });
}

exports.postDeleteProduct = async (req, res) => {
  const productId = req.body['productId'];

  await Product.findByIdAndDelete(productId);

  res.redirect('/admin/products');
}

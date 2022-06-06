const path = require("path");
const fs = require("fs");

const filePath = path.join(path.dirname(require.main.filename), 'data', 'cart.json');

module.exports = class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(filePath, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err) {
        cart = JSON.parse(fileContent.toString());
      }

      const existingProductIndex = cart.products.findIndex(product => product.id === id);
      const existingProduct = cart.products[existingProductIndex];

      if (existingProduct) {
        const updatedProduct = {
          ...existingProduct,
          quantity: existingProduct.quantity + 1
        }

        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        const updatedProduct = {
          id,
          quantity: 1
        }
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice += Number(productPrice);

      fs.writeFile(filePath, JSON.stringify(cart), (err) => {
        console.error(err);
      });
    });
  }
}

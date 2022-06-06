const fs = require('fs');
const path = require('path');

const filePath = path.join(path.dirname(require.main.filename), 'data', 'products.json');

const getProductsFromFile = (callBack) => {
  ensureDirectoryExists(filePath);

  fs.readFile(filePath, (err, fileContent) => {
    if (err) {
      callBack([]);
      return;
    }

    callBack(JSON.parse(fileContent.toString()));
  });
}

const ensureDirectoryExists = (filePath) => {
  const dirName = path.dirname(filePath);

  if (fs.existsSync(dirName)) {
    return true;
  }

  fs.mkdirSync(dirName, { recursive: true });
}

module.exports = class Product {
  constructor({ id, title, imageUrl, description, price }) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile((products) => {
      if (this.id) {
        const existingProductIndex = products.findIndex(product => product.id === this.id);

        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;

        fs.writeFile(filePath, JSON.stringify(updatedProducts), (err) => {
          console.error(err);
        });
      } else {
        this.id = Math.floor(Math.random() * 2_000_000_000).toString();

        products.push(this);

        fs.writeFile(filePath, JSON.stringify(products), (err) => {
          console.error(err);
        });
      }
    });
  }

  static fetchAll(callBack) {
    getProductsFromFile(callBack);
  }

  static findById(id, callBack) {
    getProductsFromFile((products) => {
      const product = products.find((product) => product.id === id);

      callBack(product);
    });
  }

  static deleteById(id) {
    getProductsFromFile((products) => {
      const updatedProducts = products.filter(product => product.id !== id);

      fs.writeFile(filePath, JSON.stringify(updatedProducts), (err) => {
        console.error(err);
      });
    });
  }
}

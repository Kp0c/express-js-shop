const { getDb } = require('../util/database');
const mongodb = require("mongodb");

class Product {
  constructor({title, price, description, imageUrl, userId}) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this.userId = userId;
  }

  async save(id) {
    const db = getDb();

    if (id) {
      await db.collection('products').updateOne({
        _id: new mongodb.ObjectId(id)
      }, {
        $set: this
      });
    } else {
      await db.collection('products').insertOne(this);
    }
  }

  static async fetchAll() {
    const db = getDb();

    return await db.collection('products').find().toArray();
  }

  static async findById(productId) {
    const db = getDb();

    return await db.collection('products').findOne({
      _id: new mongodb.ObjectId(productId)
    });
  }

  static async deleteById(productId) {
    const db = getDb();

    await db.collection('products').deleteOne({
      _id: new mongodb.ObjectId(productId)
    });

    await db.collection('users').updateMany({}, {
      $pull: {
        'cart.items': {
          productId: new mongodb.ObjectId(productId)
        }
      }
    });
  }
}

module.exports = Product;

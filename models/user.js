const { getDb } = require("../util/database");
const mongodb = require("mongodb");

class User {
  constructor({name, email, cart, id}) {
    this.name = name;
    this.email = email;
    this.cart = cart ?? { items: [] };
    this._id = id ? new mongodb.ObjectId(id) : null;
  }

  async save() {
    const db = getDb();

    await db.collection('users').insertOne(this);
  }

  async addToCart(product) {
    const cartProductIdx = this.cart.items.findIndex(item => item.productId.equals(product._id));

    const updatedCartItems = [...this.cart.items];

    if (cartProductIdx >= 0) {
      updatedCartItems[cartProductIdx].quantity += 1;
    } else {
      updatedCartItems.push({
        productId: product._id,
        quantity: 1
      });
    }

    this.cart.items = updatedCartItems;

    const db = getDb();
    await db.collection('users').updateOne({
      _id: this._id
    }, {
      $set: {
        cart: this.cart
      }
    });
  }

  async deleteFromCart(productId) {
    this.cart.items = this.cart.items.filter(item => !item.productId.equals(productId));

    const db = getDb();
    await db.collection('users').updateOne({
      _id: this._id
    }, {
      $set: {
        cart: this.cart
      }
    });
  }

  async getCart() {
    const db = getDb();

    const products = await db.collection('products').find({
      _id: {
        $in: this.cart.items.map(item => item.productId)
      }
    }).toArray();

    return this.cart.items.map((item) => ({
      ...products.find(product => product._id.equals(item.productId)),
      quantity: item.quantity
    }));
  }

  async addOrder() {
    const db = getDb();

    const cartItems = await this.getCart();

    await db.collection('orders').insertOne({
      items: cartItems,
      user: {
        _id: this._id,
        name: this.name
      }
    });

    await db.collection('users').updateOne({
      _id: this._id
    }, {
      $set: {
        cart: null
      }
    });
  }

  async getOrders() {
    const db = getDb();

    return await db.collection('orders').find({
      'user._id': this._id
    }).toArray();
  }

  static async findById(userId) {
    const db = getDb();

    return await db.collection('users').findOne({
      _id: new mongodb.ObjectId(userId)
    });
  }
}

module.exports = User;

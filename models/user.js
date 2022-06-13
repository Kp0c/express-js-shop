const mongoose = require('mongoose');
const { Schema } = mongoose;
const Order = require('./order');

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ]
  },
});

userSchema.methods.addToCart = async function(product) {
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

  await this.save();
}

userSchema.methods.getCartItems = async function() {
  const populatedUser = await this.populate('cart.items.productId');

  return populatedUser.cart.items.map((item) => ({
    ...item.productId._doc,
    quantity: item.quantity
  }));
}

userSchema.methods.deleteFromCart = async function(productId) {
  this.cart.items = this.cart.items.filter(item => !item.productId.equals(productId));

  await this.save();
}

userSchema.methods.addOrder = async function() {
  const cartItems = await this.getCartItems();

  const order = new Order({
    user: this._id,
    items: cartItems
  });

  this.cart.items = [];

  await order.save();
  await this.save();
}

userSchema.methods.getOrders = async function() {
  return await Order.find({user: this._id});
}

const User = mongoose.model('User', userSchema);

module.exports = User;

//
//   async deleteFromCart(productId) {
//     this.cart.items = this.cart.items.filter(item => !item.productId.equals(productId));
//
//     const db = getDb();
//     await db.collection('users').updateOne({
//       _id: this._id
//     }, {
//       $set: {
//         cart: this.cart
//       }
//     });
//   }
//
//   async getCart() {
//     const db = getDb();
//
//     const products = await db.collection('products').find({
//       _id: {
//         $in: this.cart.items.map(item => item.productId)
//       }
//     }).toArray();
//
//     return this.cart.items.map((item) => ({
//       ...products.find(product => product._id.equals(item.productId)),
//       quantity: item.quantity
//     }));
//   }
//
//   async addOrder() {
//     const db = getDb();
//
//     const cartItems = await this.getCart();
//
//     await db.collection('orders').insertOne({
//       items: cartItems,
//       user: {
//         _id: this._id,
//         name: this.name
//       }
//     });
//
//     await db.collection('users').updateOne({
//       _id: this._id
//     }, {
//       $set: {
//         cart: null
//       }
//     });
//   }
//
//   async getOrders() {
//     const db = getDb();
//
//     return await db.collection('orders').find({
//       'user._id': this._id
//     }).toArray();
//   }
//
//   static async findById(userId) {
//     const db = getDb();
//
//     return await db.collection('users').findOne({
//       _id: new mongodb.ObjectId(userId)
//     });
//   }
// }
//
// module.exports = User;

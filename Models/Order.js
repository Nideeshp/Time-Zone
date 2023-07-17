const mongoose = require('mongoose');
const Product=require('./Product')

const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
  },
  address: {
    type: String,
  },
  paymentMethod: {
    type: String,
  },
  status: {
    type: String,
  },
  productDt: {
    items: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: Product,
        },
        qty: {
          type: Number,
        },
      },
    ],
    totalprice: Number,
  },
  discountprice: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;

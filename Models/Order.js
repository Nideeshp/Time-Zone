const mongoose = require('mongoose');

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
  deliveryDate:{
    type:String,
  },
  returnDate:{
    type:Date,
  },
  productDt: {
    items: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: 'Product',
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

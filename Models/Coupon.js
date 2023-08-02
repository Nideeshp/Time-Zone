const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },
  discount: {
    type: Number,
    min: 0,
    max: 100
  },
  expirationDate: {
    type: Date,
    required: true
  },
  maxDiscount: {
    type: Number,
    required: true
  },
  MinPurchaceAmount: {
    type: Number,
    required: true
  },
  userUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Coupon', couponSchema);

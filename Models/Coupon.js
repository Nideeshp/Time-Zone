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
  percentageOff: {
    type: Number,
    required: true,
    min: 0,
    max: 100  
  },
  userUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Coupon', couponSchema);

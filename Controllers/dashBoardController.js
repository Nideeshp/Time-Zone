const User = require("../models/User");
const Product = require("../models/Product");
const Banner = require("../Models/Banner");
const Coupon = require("../models/Coupon");

module.exports = {
  dashboardView: async (req, res) => {
    if(req.session.loggedIn) {
      let sep = 0;
      const products = await Product.find();
      const coupons= await Coupon.find()      
      const add = await Banner.find({});
      res.render("home", { 
        user: req.session.user,
        products: products,
        add: add,
        coupons:coupons
      });
    } else {
      res.redirect('/login')
    }
  },
};

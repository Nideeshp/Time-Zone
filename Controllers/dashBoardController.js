const User = require("../models/user");
const Product = require("../models/product");
const Banner = require("../models/banner");
const Coupon = require("../models/coupon");

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

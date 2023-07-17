const User = require("../models/User")
const Product=require('../models/Product')

module.exports={
    dashboardView:async(req,res)=>{
      console.log(req.session.user);
        const products = await Product.find();
        console.log(products);
        res.render("home",{
            user:req.session.user,products:products
        })
    }
}
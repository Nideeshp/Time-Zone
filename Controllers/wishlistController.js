const User=require('../models/User')
const Product = require('../models/Product');
const Category = require('../models/Category');



const loadwishlist = async (req, res,next) => {
  try {

     if(req.session.user){
      const id = req.session.user._id;  
      const userdetails = await User.findOne({ _id: id });
      const wishlistData = await User.findOne({ _id: userdetails._id }).populate('wishlist.product').exec()
      const categorydata = await Category.find({})

      res.render('wishlist',{
        userdetails:userdetails,
        wishlistData:wishlistData,
        categorydata:categorydata
      })


     }else{
      res.redirect('/login')
     }

  } catch (error) {
    next(error)
  }
}











  const addToWishlist = async (req, res, next) => {
    try {
      if (req.session.user) {
          const  id = req.params.id;
        const found = await User.findOne({ username: req.session.user.username, "wishlist.product": id })
        if (found) {
  
          res.json({exist:true})
          
        } else {
          const usename = req.session.user.name;
          const userdetails = await User.findOne({ name: usename })
          const username = req.session.user._id;
          const wishlistInserted = await User.updateOne({ _id: username }, { $push: { wishlist: { product: req.params.id } } })
          const wishlistData = await User.findOne({ _id: userdetails._id }).populate('wishlist.product').exec()
          res.json({done:true})
  
        }
      } else {
      
        res.json({logout:true})
  
      }
  
    } catch (error) {
      next(error);
    }
  }
  
  
  
  const removeWishlist = async (req, res, next) => {
    try {
      if (req.session.user) {
        const id = req.params.id;
        const name = req.session.user.name;
        const categorydata = await Category.find({})
        const userdetails = await User.findOne({ name: name })
        username = req.session.user.username;
        const deleteWishlist = await User.updateOne({ _id:userdetails._id }, { $pull: { wishlist: { product: id } } })
        const wishlistData = await User.findOne({ _id: userdetails._id }).populate('wishlist.product').exec()
        res.render('wishlist', {
          categorydata: categorydata,
          userdetails: userdetails,
          wishlistData: wishlistData
        })
      } else {
  
        res.redirect('/login')
  
      }
  
    } catch (error) {
      next(error);
    }
  }
  
  module.exports = {
    loadwishlist,
    addToWishlist,
    removeWishlist
  }
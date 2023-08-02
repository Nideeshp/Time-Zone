const Product = require('../models/Product');
const Category=require('../models/Category');
const User=require('../models/User')
const Cart=require('../models/Cart')
const Coupon=require('../models/Coupon')



const loadCoupon=async(req,res,next)=>{
    try {
        const coupons=await Coupon.find()
        res.render('admin/coupons',{coupons:coupons})
    } catch (error) {
        next(error)
    }
}


const loadAddCoupons=async(req,res,next)=>{
    try {
        res.render('admin/addcoupon')
    } catch (error) {
        next(error)
    }
}



//insert coupon to database
const insertCoupon=async (req,res,next)=>{
    try {
        const name = req.body.code
        const regex = new RegExp(name, "i");
        const data = await Coupon.find({ code: { $regex: regex } })
        datalen = data.length
    if(datalen==1){
        res.render('addcoupon',{message:'coupon already exists'})
    }else{
       
       const coupon=new Coupon({
        code:req.body.code,
        discount:req.body.discount, 
        expirationDate:req.body.expirationDate,
        maxDiscount:req.body.maxDiscount,
        MinPurchaceAmount:req.body.MinPurchaceAmount,
        percentageOff:req.body.percentageOff
       })
       const saving=await coupon.save()
       res.redirect('coupons')

  }  } catch (error) {

        next(error);

    }
}


const deleteCoupon=async(req,res,next)=>{
    try {
        const id=req.params.id
        id.trim()
        await Coupon.deleteOne({_id:id})
        res.json('coupons')
    } catch (error) {
        next(error)
    }
}


const applyCoupon = async (req, res, next) => {
    try {
      const couponDetails = await Coupon.findOne({ code: req.body.code });
      if (couponDetails) {
        const user = await User.findOne({ username: req.session.user.username });
        const found = await Coupon.findOne({
          code: req.body.code,
          userUsed: { $in: [user._id] },
        });
        const code = couponDetails.code;
        const datenow = Date.now();
        if (found) {
          res.json({ used: true });
        } else {
          if (datenow <= couponDetails.expirationDate) {
            if (couponDetails.MinPurchaceAmount <= req.body.subtotal) {
              const discountValue=couponDetails.maxDiscount
                let value = req.body.subtotal -   discountValue;
                res.json({ amountokay: true, value,discountValue, code }); 
            } else {
              res.json({ amountnokay: true });
            }
          } else {
            res.json({ datefailed: true });
          }
        }
      } else {
        res.json({ invalid: true });
      }
    } catch (error) {
      next(error);
    }
  };
  




//edit coupon
const EditCoupon=async(req,res,next)=>{
    try {

        const id=req.params.id
        const couponDta=await Coupon.findOne({_id:id})
        res.render('admin/editcoupon',{coupondata:couponDta})

    } catch (error) {

        next(error)

    }
}


//save coupon
const SaveCoupon=async(req,res,next)=>{
    try {

        const id=req.params.id
        await Coupon.updateOne({_id:id},{$set:{
        code:req.body.code,
        expirationDate:req.body.expirationDate,
        maxDiscount:req.body.maxDiscount,
        MinPurchaceAmount:req.body.MinPurchaceAmount,
        percentageOff:req.body.percentageOff
    }})
       res.redirect('/admin/coupons')
    } catch (error) {

        next(error)
        
    }
}







module.exports={
    loadCoupon,
    loadAddCoupons,
    insertCoupon,
    deleteCoupon,
    EditCoupon,
    SaveCoupon,
    applyCoupon
}
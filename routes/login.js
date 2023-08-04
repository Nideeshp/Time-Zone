const express = require("express");
const router = express.Router();
const nocache= require('nocache')

const {
  registerView,
  loginView,
  registerUser,
  loginUser,
  otpView,
  otpUser,
  shopView,
  viewProduct,
  forgetPassword,
  forgetOtp,
  fgOtp,
  setPassword,
  changePassword,
} = require("../controllers/usercontroller");
const { dashboardView } = require("../controllers/dashBoardcontroller");
const { checkBlocked } = require("../controllers/admincontroller");
const wishlistController = require("../controllers/wishlistcontroller");
const cartController = require("../controllers/cartcontroller");
const checkoutController = require("../controllers/checkoutcontroller");
const auth = require("../middlewares/userauth");
const userController = require("../controllers/usercontroller");
const couponController = require("../controllers/couponcontroller");

router.get("/register",auth.logout, registerView);
router.get("/login",nocache(),userController.loginView);
router.get("/otp", auth.verifyUser,otpView);
router.get("/shop",auth.verifyUser,shopView);

// Home
router.get("/home", auth.verifyUser, dashboardView);
router.post("/register",userController.registerUser);
router.post("/doLogin",auth.logout,userController.loginUser);
router.post("/otp", auth.verifyUser,otpUser);

// View products
router.get("/viewproduct/:id",viewProduct);

//forget password
router.get("/forgetpassword", forgetPassword);
router.post("/forgetpassword", forgetOtp);
router.get("/setpassword", setPassword);
router.post("/otp2", fgOtp);
router.post("/setpassword", changePassword);

//view wishlist
router.get("/wishlist", auth.verifyUser, wishlistController.loadwishlist);
router.get("/addtoWishlist/:id", wishlistController.addToWishlist);
//remove wishlist
router.get("/removeWishlist/:id", wishlistController.removeWishlist);
//post
router.post("/addtowishlist/:id", wishlistController.addToWishlist);

//cart
router.get("/cart", auth.verifyUser, cartController.viewCart);
router.get("/addtocart",auth.verifyUser,cartController.addtoCart);

router.post("/deletecart",auth.verifyUser,cartController.deleteCart);
router.post("/addtocart/:id",auth.verifyUser,cartController.addtoCart);

//change product quantity
router.post("/change-quantity",auth.verifyUser,cartController.changeQnty);

router.get("/user", auth.verifyUser, userController.userProfile);

//edited profile
router.post("/editedProfile",auth.verifyUser,userController.editedProfile);

//address
router.get("/address",auth.verifyUser,userController.addressView);

//checkout
router.get("/checkout", auth.verifyUser, checkoutController.checkoutView);

//post method for add address
router.post("/addAddress",auth.verifyUser,userController.addAddress);

//post method for place order
router.post("/placeOrder", auth.verifyUser, checkoutController.placeOrder);

router.get("/orders",auth.verifyUser,userController.orderview);

//cancel orders
router.post("/cancelOrder",auth.verifyUser,userController.cancelOrder);

//apply coupon
router.post("/applyCoupon",auth.verifyUser,couponController.applyCoupon);

//success page

router.get("/success",auth.verifyUser,checkoutController.successPage);

//razorpay
router.post("/verifyPayment-online",auth.verifyUser,checkoutController.verifyPayment);

//wallet

router.get("/wallet",auth.verifyUser,userController.wallet);


//return product
router.post('/returnProduct',auth.verifyUser,userController.returnProduct)


//get method for logout
router.get("/logout", auth.logout);

module.exports = router;

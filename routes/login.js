const express = require("express");
const router = express.Router();

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
} = require("../Controllers/userController");
const { dashboardView } = require("../Controllers/dashBoardController");
const { checkBlocked } = require("../Controllers/adminController");
const wishlistController = require("../Controllers/wishlistController");
const cartController = require("../Controllers/cartController");
const checkoutController = require("../Controllers/checkoutController");
const auth = require("../middlewares/auth");
const userController = require("../Controllers/userController");
const couponController=require('../Controllers/couponController')

router.get("/register", registerView);
router.get("/login", loginView);
router.get("/otp", otpView);
router.get("/shop", shopView);

// Home
router.get("/home", auth.verifyUser, dashboardView);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/otp", otpUser);

// View products
router.get("/viewproduct/:id", viewProduct);

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
router.get("/addtocart", cartController.addtoCart);

router.post("/deletecart", cartController.deleteCart);
router.post("/addtocart/:id", cartController.addtoCart);

//change product quantity
router.post("/change-quantity", cartController.changeQnty);

router.get("/user",auth.verifyUser,userController.userProfile);

//edited profile
router.post("/editedProfile", userController.editedProfile);

//address
router.get("/address", userController.addressView);

//checkout
router.get("/checkout", checkoutController.checkoutView);

//sort
router.get("/shop", userController.getProducts);

//filter
router.get("/filter", userController.filterCategory);

//post method for add address
router.post("/addAddress", userController.addAddress);

//post method for place order
router.post("/placeOrder", auth.verifyUser, checkoutController.placeOrder);

router.get('/orders',userController.orderview)

//cancel orders
router.post('/cancelOrder',userController.cancelOrder)


//apply coupon
router.post('/applyCoupon',couponController.applyCoupon)


//success page

router.get('/success',checkoutController.successPage)

//razorpay
router.post('/verifyPayment-online',checkoutController.verifyPayment)

//get method for logout
router.get("/logout",auth.logout);

module.exports = router;

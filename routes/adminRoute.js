const express=require('express')
const upload=require('../middlewares/multer')
const admin_route=express();

const session=require('express-session');
const config=require('../config/config')
admin_route.use(session({secret:config.sessionSecret}))

const setNoCacheHeader = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    next();
  };
  

// admin_route.use(bodyParser.urlencoded({extended:true}));

admin_route.set('Views','./Views/admin')
const adminController=require('../controllers/admincontroller');
const usermanageController=require('../controllers/usermanagecontroller')
const categorymanageController=require('../controllers/categorymanagecontroller')
const productController=require('../controllers/productontroller');
const checkoutController=require('../controllers/checkoutcontroller')
const couponController=require('../controllers/couponcontroller')
const bannerController=require('../controllers/bannercontroller')
const auth=require('../middlewares/adminauth')
const Admin = require('../models/admin');
const nocache = require('nocache');



admin_route.get('/adminLogin',auth.isLogout,setNoCacheHeader,adminController.loadLogin);
admin_route.post('/login',adminController.verifyLogin);
admin_route.post('/create', adminController.createAdmin);
admin_route.get('/logout', auth.isLogin,adminController.logout);
//admin
admin_route.get('/adminHome',auth.isLogin,nocache(),adminController.loadDashboard)
admin_route.get('/userManage',auth.isLogin,usermanageController.loadUserMange)

//for category
admin_route.get('/categoryManage',auth.isLogin,categorymanageController.loadcategoryManage)
admin_route.post('/addCategory',auth.isLogin,categorymanageController.loadaddCategory);


// for product
admin_route.get('/productManage',auth.isLogin,productController.loadProduct);
admin_route.get('/addProduct', auth.isLogin,productController.loadaddProduct);
admin_route.post('/addProduct',auth.isLogin,upload.array('image', 4), productController.insertProduct);
admin_route.get('/deleteProduct/:id',auth.isLogin,productController.deleteProduct);

//edit product
admin_route.get('/editProduct/:id',auth.isLogin, productController.loadeditProduct);
admin_route.post('/editProducts/:id',auth.isLogin, productController.editProduct);

//edit product image
admin_route.post('/editImage/:id',auth.isLogin,upload.array('image',4),productController.loadEditImage);

//delete product image indivitually
admin_route.get('/deleteImage/:id/:imgId',auth.isLogin,productController.deleteProductImage);



// Route to block/unblock a user
admin_route.get('/userManage/block/:id',auth.isLogin,adminController.blockUser);
admin_route.get('/userManage/unblock/:id',auth.isLogin,adminController.unblockUser);

//editcategory
admin_route.get('/editcategory/:id',auth.isLogin,categorymanageController.loadeditCategory)
admin_route.post('/editcategory/:id',auth.isLogin,categorymanageController.editedCategory)


//soft delete for products
admin_route.post('/softdelete/:id',auth.isLogin,productController.softDelete)

//show order 
admin_route.get('/orderHistory',auth.isLogin,checkoutController.userOrderView)




//Coupons
admin_route.get('/coupons',auth.isLogin,couponController.loadCoupon)

admin_route.get('/addCoupons',auth.isLogin,couponController.loadAddCoupons)

//insertcoupon
admin_route.post('/addCoupons',auth.isLogin,couponController.insertCoupon)

//deletecoupon
admin_route.get('/deleteCoupon/:id',auth.isLogin,couponController.deleteCoupon)

//editcoupon
admin_route.get('/EditCoupon/:id',auth.isLogin,couponController.EditCoupon)

admin_route.post('/postEditCoupon/:id',auth.isLogin,couponController.SaveCoupon);



//banners

admin_route.get('/ads',auth.isLogin,bannerController.loadBanner)
 
admin_route.get('/addAdds',auth.isLogin,bannerController.addAds)

admin_route.post('/addAdds',upload.array('image',1),bannerController.insertAds)

admin_route.get('/editAdd/:id',auth.isLogin,bannerController.loadEditBanner);

admin_route.post('/posteditAdd/:id',auth.isLogin,upload.array('image',1),bannerController.saveEditBanner);

admin_route.delete('/deleteadd/:id',auth.isLogin,bannerController.deleteAdd);


admin_route.post('/updateOrder/:id',auth.isLogin,adminController.updateOrder)



//sales
 admin_route.post('/salesReports',auth.isLogin,adminController.salesReport)
 admin_route.get('/salesReport',auth.isLogin,adminController.salesReports)

module.exports=admin_route;
const express=require('express')
const upload=require('../middlewares/multer')
const admin_route=express();

const session=require('express-session');
const config=require('../config/config')
admin_route.use(session({secret:config.sessionSecret}))


// admin_route.use(bodyParser.urlencoded({extended:true}));

admin_route.set('Views','./Views/admin')
const adminController=require('../Controllers/adminController');
const usermanageController=require('../Controllers/usermanageController')
const categorymanageController=require('../Controllers/categorymanageController')
const productController=require('../Controllers/productController');
const checkoutController=require('../Controllers/checkoutController')
const couponController=require('../Controllers/couponController')
const Admin = require('../Models/Admin');



admin_route.get('/',adminController.loadLogin)
admin_route.post('/login',adminController.verifyLogin);
admin_route.post('/create',adminController.createAdmin);


//admin
admin_route.get('/adminHome',adminController.loadDashboard)
admin_route.get('/userManage',usermanageController.loadUserMange)

//for category
admin_route.get('/categoryManage',categorymanageController.loadcategoryManage)
admin_route.post('/addCategory',categorymanageController.loadaddCategory);


// for product
admin_route.get('/productManage', productController.loadProduct);
admin_route.get('/addProduct', productController.loadaddProduct);
admin_route.post('/addProduct', upload.array('image', 4), productController.insertProduct);
admin_route.get('/deleteProduct/:id',productController.deleteProduct);

//edit product
admin_route.get('/editProduct/:id', productController.loadeditProduct);
admin_route.post('/editProduct/:id', productController.editProduct);

//edit product image
admin_route.post('/editImage/:id',upload.array('image',4),productController.loadEditImage);

//delete product image indivitually
admin_route.get('/deleteImage/:id/:imgId',productController.deleteProductImage);



// Route to block/unblock a user
admin_route.get('/userManage/block/:id', adminController.blockUser);
admin_route.get('/userManage/unblock/:id', adminController.unblockUser);

//editcategory
admin_route.get('/editcategory/:id',categorymanageController.loadeditCategory)
admin_route.post('/editcategory/:id',categorymanageController.editedCategory)


//soft delete for products
admin_route.post('/softdelete/:id',productController.softDelete)

//show order 
admin_route.get('/orderHistory',checkoutController.userOrderView)




//Coupons
admin_route.get('/coupons',couponController.loadCoupon)

admin_route.get('/addCoupons',couponController.loadAddCoupons)

//insertcoupon
admin_route.post('/addCoupons',couponController.insertCoupon)

//deletecoupon
admin_route.get('/deleteCoupon/:id',couponController.deleteCoupon)

//editcoupon
admin_route.get('/EditCoupon/:id',couponController.EditCoupon)

admin_route.post('/postEditCoupon/:id',couponController.SaveCoupon);



//banners
admin_route.get()



module.exports=admin_route;
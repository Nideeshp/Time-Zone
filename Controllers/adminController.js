const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const Category = require("../models/category");
const Order = require("../models/order");
const Product = require("../models/product");
const Coupon= require("../models/coupon")
const moment= require('moment')
const User= require('../models/user')

const loadLogin = async (req, res) => {
  try {
    if (req.session.admin) {
      res.redirect("/admin/adminHome");
    }
    res.render("admin/adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res, next) => {
  try {
    req.session.admin = false;
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/admin/adminLogin");
    });
  } catch (error) {
    next(error);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const adminEmail = process.env.ADMIN;
    const adminPass = process.env.ADMIN_PASSWORD;

    if (email !== adminEmail && password !== adminPass) {
      res.render("admin/adminLogin", {
        message: "Email and password is incorrect",
      });
    } else {
      req.session.admin = true;
      res.redirect("/admin/adminHome");
    }
  } catch (error) {
    console.log(error.message);
  }
};


const loadDashboard = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ date: -1 });
    const users = await User.find({}).sort({ name: 1 }); 
    const categoryData= await Category.find({});
    const productData= await Product.find({}).populate('category').exec()
    const salesCount= await Order.find({status:"delivered"}).count()
    const revenueOfTheWeekly= await Order.aggregate([
      {
        $match:{
          date:{
            $gte: new Date(new Date().setDate(new Date().getDate()-7))
          },status:{
            $eq:"delivered"
          }
        }
      },
      {
        $group:{
          _id:null,
          totalAmount:{$sum :"$total"}
        }
      }
    ])

    const weeklyRevenue= revenueOfTheWeekly.map((item)=>{
      return item.totalAmount;
    })

const cancelledOrdersCount= await Order.aggregate([
  {
    $match:{status:"cancelled"}
  },
  {
    $group:{
      _id:null,
      count:{$sum:1}
    }
  }
])

const cancelledOrders= cancelledOrdersCount.map((item)=>{
  return item.count
})

const toatalCustomers=await User.find({}).count()
const lastWeek= new Date();
lastWeek.setDate(lastWeek.getDate()-7);
const usersForTheLastWeek= await User.find({date:{$gte:lastWeek}})
const lessQuantityProducts = await Product.find({ stock: { $lt: 50 } })
const ativeCoupons = await Coupon.find({ expirationDate: { $gt: new Date() } })

const salesChart = await Order.aggregate([
  {
    $match: {
      status: { $eq: "delivered" },
      date: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) },
    },
  },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
      sales: { $sum: "$productDt.totalprice" },
    },
  },
  {
    $sort: { _id: 1 },
  },
  {
    $limit: 7,
  },
]);





const date = salesChart.map((item)=>{
  return item._id;
})
const sales= salesChart.map((item)=>{
  return item.sales
})


const confirmed= await Order.find({status:"pending"}).count()
const delivered = await Order.find({status:"delivered"}).count()
const shipped= await Order.find({status:"processing"}).count()
const cancelled= await Order.find({status:"cancelled"}).count()
const UPI = await Order.find({paymentMethod:"ONLINE",status:"delivered"}).count()
const COD= await Order.find({paymentMethod:"COD",status:"delivered"}).count()

    res.render("admin/adminHome", {
       orders, users,
       categoryData:categoryData,
       productData:productData,salesCount,weeklyRevenue,
       cancelledOrders,toatalCustomers,
       usersForTheLastWeek,lessQuantityProducts,
       ativeCoupons,confirmed,delivered,shipped,cancelled,
       UPI,COD,sales,date,
       moment:moment
     });
  } catch (error) {
    console.log(error.message);
  }
};



const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = new Admin({ email, password });
    await admin.save();
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkBlocked = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.blocked) {
      // User is blocked, redirect them to an appropriate page
      res.redirect("/blocked");
    } else {
      // User is not blocked, proceed to the next middleware or route handler
      next();
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).render("error", { error: error.message });
  }
};

const blockUser = async (req, res) => {
  const userId = req.params.id;

  try {
    await User.updateOne({ _id: userId }, { $set: { blocked: true } });
    res.json({ block: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const unblockUser = async (req, res) => {
  const userId = req.params.id;

  try {
    await User.updateOne({ _id: userId }, { $set: { blocked: false } });
    res.json({ unblock: true });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
};

const updateOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;



    // Find the order by ID and update the status
    const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ message: 'Order status updated succeviewssfully', order});
    
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

const salesReport = async (req,res,next)=>{
  try {
    const existingDate= new Date(req.body.to)
    const newDate = new Date(existingDate)
    newDate.setDate(existingDate.getDate()+1)

    if(req.body.form =="" || req.body.to ==""){
      res.render('admin/sales',{message:"all fields are required"})
    }else{
      const ss= await Order.find({
        status:"delivered",date:{
          $gte:new Date(req.body.from),
          $lte:new Date(newDate)
        }
      }).populate("productDt.items.productId")
      res.render("admin/salesreport",{ss})
    }
  } catch (error) {
    next(error)
  }
}


const salesReports= async(req,res,next)=>{
  try {
    res.render('admin/sales')
  } catch (error) {
    next(error)
  }
}




module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  createAdmin,
  blockUser,
  unblockUser,
  checkBlocked,
  logout,
  updateOrder,
  salesReport,
  salesReports
};

const User = require("../models/User");
const Product = require("../models/Product");
const Category=require('../models/Category')
const Cart=require('../models/Cart')
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Order=require('../models/Order')


module.exports = {
  registerView: (req, res) => {
    res.render("register", {});
  },

  //for view
  loginView: (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/home");
    } else {
      res.render("login", {});
    }
  },
  otpView: (req, res) => {
    console.log("object");
    res.render("otp", {});
  },

  shopView: async (req, res) => {
    try {
      const products= await Product.find()
      res.render('shop',{products})
      
    } catch (error) {
      console.log(error);
    }
  },

  
  logoutUser:async(req,res,next)=>{
    try {
     if(req.session.user){
      req.session.destroy()
      res.redirect('/login')
     } 
    } catch (error) {
      next(error)
    }
  },



  // },
  otpUser: (req, res) => {
    const { otp1, otp2, otp3, otp4 } = req.body;
    console.log(req.body);
    const enteredOTP = "" + otp1 + otp2 + otp3 + otp4;
    // console.log(`Otp entered:${otp}`)
    const generatedOTP = req.session.OTP;
    console.log(generatedOTP, "===", enteredOTP);
    if (enteredOTP === generatedOTP) {
      console.log("OTP verified successfully");
      res.redirect("/login");
    } else {
      console.log("Invalid Otp");
      res.render("otp", {});
    }
  },

  //post request that handles register
  registerUser: (req, res) => {
    console.log("object");
    const { name, email, location, password, confirm } = req.body;
    if (!name || !email || !password || !confirm) {
      console.log("Fill empty fields");
    }

    //confirm passwords
    if (password !== confirm) {
      console.log("Password must match");
    } else {
      //validation
      User.findOne({ email: email }).then((user) => {
        if (user) {
          console.log("email exists");
          res.render("register", {
            name,
            email,
            password,
            confirm,
          });
        } else {
          //OTP generating function
          function generateOTP() {
            const min = 1000; // Minimum value (inclusive)
            const max = 9999; // Maximum value (inclusive)
            return Math.floor(Math.random() * (max - min + 1) + min).toString();
          }
          const OTP = generateOTP();
          req.session.OTP = OTP;
          //OTP verfication
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD,
            },
          });
          const mailOptions = {
            from: "nideeshnd313@gmail.com",
            to: email,
            subject: "TimeZone give a Otp",
            text: `This is your one time password don't share it ${OTP}`,
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent" + info.response);
            }
          });
          //validation
          const newUser = new User({
            name,
            email,
            location,
            password,
          });
          //password hashing
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(res.redirect("/otp"))
                .catch((err) => console.log(err));
            });
          });
        }
      });
    }
  },
  loginUser: (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);

    //required
    if (!email || !password) {
      console.log("please fill in all the fields");
      res.render("login", {
        email,
        password,
      });
    } else {
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            console.log("User not found");
            res.render("login", {
              email,
              password,
            });
          } else {
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {
                req.user = user;
                req.userLogged = true;
                console.log(req.user);
                console.log("Login successful");
                req.session.loggedIn = true;
                req.session.user = user;
                res.redirect("/home");
              } else {
                console.log("Incorrect password");
                res.render("login", {
                  email,
                  password,
                });
              }
            });
          }
        })
        .catch((err) => console.log(err));
    }
  },
  viewProduct: async (req, res, next) => {
    try {
      const productId = req.params.id;
      const products = await Product.findById(productId).populate("category");
      console.log(products);
      res.render("viewproduct", { product: products });
    } catch (error) {
      next(error);
    }
  },

  forgetPassword: async (req, res, next) => {
    try {
      res.render("forgetpassword");
    } catch (error) {
      next(error);
    }
  },
  forgetOtp: async (req, res, next) => {
    const { email } = req.body;
    console.log(req.body);
    if (!email) {
      console.log("please enter your email");
      res.render("forgetpassword", { email });
    } else {
      User.findOne({ email: email }).then((user) => {
        if (!user) {
          console.log("user not found");
          res.render("forgetpassword", { email });
        } else {
          //OTP generating function
          function generateOTP() {
            const min = 1000; // Minimum value (inclusive)
            const max = 9999; // Maximum value (inclusive)
            return Math.floor(Math.random() * (max - min + 1) + min).toString();
          }
          const OTP = generateOTP();
          req.session.OTP = OTP;
          console.log("ys working");
          //OTP verfication
          const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD,
            },
          });
          const mailOptions = {
            from: "nideeshnd313@gmail.com",
            to: email,
            subject: "TimeZone give a Otp",
            text: `This is your one time password don't share it ${OTP}`,
          };
          transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
              console.log(error);
            } else {
              console.log("Email sent" + info.response);
            }
          });
          res.render("otp2");
        }
      });
    }
  },
  fgOtp: (req, res) => {
    const { otp1, otp2, otp3, otp4 } = req.body;
    console.log(req.body);
    const enterOTP = "" + otp1 + otp2 + otp3 + otp4;
    // console.log(`Otp entered:${otp}`)
    const generateOTP = req.session.OTP;
    console.log(generateOTP, "===", enterOTP);
    if (enterOTP === generateOTP) {
      console.log("OTP verified successfully");
      res.redirect("/setpassword");
    } else {
      console.log("Invalid Otp");
      res.render("otp", {});
    }
  },
  setPassword: (req, res, next) => {
    try {
      res.render("setpassword");
    } catch (error) {
      next(error);
    }
  },
  // Assuming you have the necessary imports and dependencies

  changePassword: async (req, res, next) => {
    try {
      if (req.body.password == "" || req.body.confirm == "") {
        return res.json({ required: true });
      }

      const email = req.body.email;
      const newpassword = req.body.password;
      const confirm = req.body.confirm;
      console.log(email, newpassword, confirm);

      if (newpassword !== confirm) {
        return res.json({ failedToMatch: true });
      }

      const hashedPassword = await bcrypt.hash(newpassword, 10);
      console.log(hashedPassword);
      await User.updateOne(
        { email: email },
        { $set: { password: hashedPassword } }
      ).then((resp) => console.log(resp));

      res.redirect("/login");
    } catch (error) {
      return next(error);
    }
  },

  userProfile:async(req,res,next)=>{
    try {
      if(req.session.user){
        const name=req.session.user.name;
        const ids= await User.findOne({name:name})
        const userdetails=await User.findOne({_id:ids._id})
        const categorydata=await Category.find({})
        res.render('profile',{
          userdetails:userdetails,
          categorydata:categorydata
        })
        console.log(req.session.user,"this user user");
      }else{
        res.redirect('/login')
      }
    } catch (error) {
      next(error)
    }

  },

//edited profile
  editedProfile:async(req,res,next)=>{
    try {
      if(req.session.user){
        if(req.body.name==""||req.body.email==""){
          res.json({NullField:true})
        }else{
          const update=await User.updateOne({name:req.session.user.name},{
            $set:{
              name:req.body.name,
              email:req.body.email
            }
          })
          res.json({done:true})
        }
      }else{
        res.redirect("/login");
      }
    } catch (error) {
      next(error)
    }
  },

  



//addressView

addressView:async(req,res,next)=>{
try {
  if(req.session.user){
    const name=req.session.user.name
    const userdetails=await User.findOne({name:name});
    const datas=await User.findOne({_id:userdetails._id})
    const categorydata=await Category.find({});
    res.render('address',{
      userdetails:userdetails,
      categorydata:categorydata,
      datas:datas
    })
  }else{
    res.redirect('/login')
  }
} catch (error) {
  next(error)
}
},


addAddress:async(req,res,next)=>{
try {
  if(req.session.user){
    if(req.body){
      console.log(req.body.houseName,"this is housename.......");
      const nwAdd = {
        houseName:req.body.houseName,
        street:req.body.street,
        district:req.body.district,
        state:req.body.state,
        pincode:req.body.pincode,
        country:req.body.country,
        phone:req.body.phone
      }
      User.updateOne({_id: req.session.user._id}, {
        $push: {
          address: nwAdd,
        }
      }).then((response) => {
        console.log(response)
      res.redirect('/user')
      })
      }
  }else {
    res.redirect('/login')
  }
  } catch (error) {
  next(error)
}
},
getProducts: async (req, res) => {
  try {
    console.log('HEllo dfjier');
    const baseCategory = await Category.find();

    let search = req.query.search || "";
    let filter2 = req.query.filter || "ALL";
    let categoryId = req.query.categoryId;
    let filter = [];

    console.log(req.query);

    var minPrice = 0;
    var maxPrice = 100000;
    var sortValue = 1;

    console.log(search + "jghmjg");

    if (req.query.minPrice) {
      minPrice = req.query.minPrice;
    }

    if (req.query.maxPrice) {
      maxPrice = req.query.maxPrice;
    }


    if (req.query.sortValue) {
      sortValue = req.query.sortValue;
    }

    if (categoryId) {
      query.category = categoryId;
    }

    let sort = req.query.sort || "0";
    const pageNO = parseInt(req.query.page) || 1;
    const perpage = 6;
    const skip = perpage * (pageNO - 1);
    const catData = await Category.find({ status: false });
    let cat = catData.map((category) => category._id);

    filter = filter2 === "ALL" ? [...cat] : req.query.filter.split(",");
    if (filter2 !== "ALL") {
      filter = filter.map((filterItem) => new ObjectId(filterItem));
    }
    sort = req.query.sort == "High" ? -1 : 1;

    minPrice = Number(minPrice);
    maxPrice = Number(maxPrice);

    const data = await Product.aggregate([
      {
        $match: {
          name: { $regex: search, $options: "i" },
          category: { $in: filter },
          price: { $gte: minPrice, $lt: maxPrice },
          status: false,
        },
      },
      { $sort: { price: sort } },
      { $skip: skip },
      { $limit: perpage },
    ]);

    const productCount = await Product
      .find({
        name: { $regex: search, $options: "i" },
        category: { $in: filter },
        price: { $gte: minPrice, $lt: maxPrice },
      })
      .countDocuments();

    const totalPage = Math.ceil(productCount / perpage);

    let cartCount = 0;
    if (req.session.user) {
      const countCart = await Cart.findOne({ user: req.session.userId });
      if (countCart && countCart.product) {
        cartCount = countCart.product.length;
      }
    }
    console.log(filter,"filter ======");

    res.render("shop", {
      user: data,
      data2: catData,
      total: totalPage,
      filter: filter2, // Change filter to filter2
      sort: sort,
      search: search,
      cartCount: cartCount,
      categoryId: categoryId,
      baseCategory,
      minPrice,
      maxPrice,
      sortValue,
    });
  } catch (error) {
    console.log(error);
  }
},


filterCategory : async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const categoryId = req.query.id;
    const data2 = await Category.find().lean();
    const data = await Product.find({ category: categoryId }).populate("category");
    const pageNO = req.query.page;
    const count = await Product
      .find(
        {
          category: categoryId,
          $or: [
            { name: { $regex: ".*" + search + ".*", $options: "i" } },
            { brand: { $regex: ".*" + search + ".*", $options: "i" } },
          ],
        }
      )
      .countDocuments();
    const perpage = 6;
    const totalpage = Math.ceil(count / perpage);
    let a = [];
    let i = 0;
    for (var j = 1; j <= totalpage; j++) {
      a[i] = j;
      i++;
    }

    res.render("shop", { user: data, data2, total: a });
  } catch (error) {
    console.log(error.message);
  }
},

orderview: async (req, res, next) => {
  try {
    if (req.session.user) {
      const userId = req.session.user._id;
      const orders = await Order.find({ userId: userId })
        .sort({ date: -1 })
        .populate({
          path: 'productDt.items',
          populate: {
            path: 'productId',
            select: 'name',
          },
        });

      res.render('orders', {
        orders: orders,
      });
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    next(error);
  }
},
cancelOrder: async (req, res, next) => {
  try {
    const orderId = req.body.orderId;
    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.status !== 'placed' && order.status !== 'pending') {
      return res.status(400).json({ error: 'Order cannot be cancelled' });
    }

    // Update the order status to "cancelled"
    order.status = 'cancelled';
    await order.save();

    res.redirect('/orders'); // Redirect to the user order history page

  } catch (error) {
    next(error);
  }
},


}
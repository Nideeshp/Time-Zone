const User = require("../models/user");
const Product = require("../models/product");
const Category = require("../models/category");
const Cart = require("../models/cart");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const Order = require("../models/order");
const Coupon = require("../models/coupon");

module.exports = {
  registerView: (req, res, next) => {
    try {
      if (req.query.ref) {
        req.session.userRef= req.query.ref;
        req.session.ref=500
       }
      res.render("register");
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
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
    res.render("otp", {});
  },

  shopView: async (req, res) => {
    try {
      const products = await Product.find();
      res.render("shop", { products });
    } catch (error) {
      res.status(500).send('Internal Server Error');
    }
  },

  logoutUser: async (req, res, next) => {
    try {
      if (req.session.user) {
        req.session.destroy();
        res.redirect("/login");
      }
    } catch (error) {
      next(error);
    }
  },

  // },
  otpUser: (req, res) => {
    const { otp1, otp2, otp3, otp4 } = req.body;
    const enteredOTP = "" + otp1 + otp2 + otp3 + otp4;
    const generatedOTP = req.session.OTP;
    if (enteredOTP === generatedOTP) {
      res.redirect("/login");
    } else {
      res.render("otp", {});
    }
  },

  //post request that handles register
registerUser: async (req, res) => {
  const { name, email, location, password, confirm } = req.body;

  if (!name || !email || !password || !confirm) {
    return res.render("register", {
      name,
      email,
      password,
      confirm,
      errormessage:"Fill empty fields",
    });
  }

  // Confirm passwords
  if (password !== confirm) {
    return res.render("register", {
      name,
      email,
      password,
      confirm,
      errormessage:"Password must match",
    });
  }


  try {
    // Check if the email already exists
    const user = await User.findOne({ email: email });
    if (user) {
      return res.render("register", {
        name,
        email,
        password,
        confirm,
        errormessage:"Email already exists"
      });
    }

    // Generate and send OTP
    function generateOTP() {
      const min = 1000; // Minimum value (inclusive)
      const max = 9999; // Maximum value (inclusive)
      return Math.floor(Math.random() * (max - min + 1) + min).toString();
    }

    const OTP = generateOTP();
    req.session.OTP = OTP;

    // OTP verification
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
      text: `This is your one-time password don't share it ${OTP}`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent" + info.response);
      }
    });

   const ref= req.session.ref

    // Add referral bonus to the new user's wallet
    const newUser = new User({
      name,
      email,
      location,
      password,
      wallet:ref
      
    });

    // Password hashing
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);

    await newUser.save();
    const useridref= req.session.userRef
    await User.findOneAndUpdate({_id:useridref},{$inc:{wallet:1000}})
    req.session.ref=null
    req.session.userRef=null
    res.redirect("/otp");
  } catch (error) {
    res.status(500).send("Error during registration");
  }
},

  loginUser: (req, res) => {
    const { email, password } = req.body;
    //required
    if (!email || !password) {
      res.redirect("/login");
    } else {
      User.findOne({ email: email })
        .then((user) => {
          if (!user) {
            res.redirect("/login");
          } else {
            bcrypt.compare(password, user.password, (err, isMatch) => {
              if (err) throw err;
              if (isMatch) {

                if (user.referralCode) {
                  // Add the referral bonus to the user's wallet
                  user.wallet += 500;
                  user.save();
                } 




                req.user = user;
                // req.userLogged = true;
                req.session.loggedIn = true;
                req.session.user = user;
                res.redirect("/home");
              } else {
                res.redirect("/login");
              }
            });
          }
        })
        .catch((err) => console.log(err));
    }
  },

  viewProduct: async (req, res, next) => {
    try {
      const productId = req?.params?.id?.trim();
      const products = await Product.findById(productId).populate("category");
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
    if (!email) {
      res.render("forgetpassword", { email });
    } else {
      User.findOne({ email: email }).then((user) => {
        if (!user) {
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
    const enterOTP = "" + otp1 + otp2 + otp3 + otp4;
    const generateOTP = req.session.OTP;
    if (enterOTP === generateOTP) {
      res.redirect("/setpassword");
    } else {
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

      if (newpassword !== confirm) {
        return res.json({ failedToMatch: true });
      }

      const hashedPassword = await bcrypt.hash(newpassword, 10);
      await User.updateOne(
        { email: email },
        { $set: { password: hashedPassword } }
      ).then((resp) => console.log(resp));

      res.redirect("/login");
    } catch (error) {
      return next(error);
    }
  },

  userProfile: async (req, res, next) => {
    try {
      if (req.session.user) {
        const name = req.session.user.name;
        const ids = await User.findOne({ name: name });
        const userdetails = await User.findOne({ _id: ids._id });
        const categorydata = await Category.find({});
        res.render("profile", {
          userdetails: userdetails,
          categorydata: categorydata,
        });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      next(error);
    }
  },

  //edited profile
  editedProfile: async (req, res, next) => {
    try {
      if (req.session.user) {
        if (req.body.name == "" || req.body.email == "") {
          res.json({ NullField: true });
        } else {
          const update = await User.updateOne(
            { name: req.session.user.name },
            {
              $set: {
                name: req.body.name,
                email: req.body.email,
              },
            }
          );
          res.json({ done: true });
        }
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      next(error);
    }
  },

  //addressView

  addressView: async (req, res, next) => {
    try {
      if (req.session.user) {
        const name = req.session.user.name;
        const userdetails = await User.findOne({ name: name });
        const datas = await User.findOne({ _id: userdetails._id });
        const categorydata = await Category.find({});
        res.render("address", {
          userdetails: userdetails,
          categorydata: categorydata,
          datas: datas,
        });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      next(error);
    }
  },
  addAddress: async (req, res, next) => {
    try {
      if (req.session.user) {
        if (req.body) {
          const Housename = req.body.houseName.trim();
          const street = req.body.street.trim();
          const district = req.body.district.trim();
          const state = req.body.state.trim();
          const pincode = req.body.pincode.trim();
          const country = req.body.country.trim();
          const phone = req.body.phone.trim();

          if (
            !Housename ||
            !street ||
            !district ||
            !state ||
            !pincode ||
            !country ||
            !phone
          ) {
            return res
              .status(400)
              .send("Something wrong in your address please check it");
          }

          const userId = req.session.user._id;

          // Check if the address already exists for the user
          const existingAddress = await User.findOne({
            _id: userId,
            "address.houseName": req.body.houseName,
            "address.street": req.body.street,
            "address.district": req.body.district,
            "address.state": req.body.state,
            "address.pincode": req.body.pincode,
            "address.country": req.body.country,
            "address.phone": req.body.phone,
          });

          if (existingAddress) {
            // Address already exists, handle duplicate address case here
            console.log(
              "Address already exists for the user:",
              existingAddress.address
            );
            const errorMessage =
              "Address already exists. Please enter a different address.";
            const name = req.session.user.name;
            const userdetails = await User.findOne({ name });
            const datas = await User.findOne({ _id: userdetails._id });
            const categorydata = await Category.find({});

            // Render the 'address' template with the errorMessage
            res.render("address", {
              errorMessage,
              userdetails,
              categorydata,
              datas,
            });
          } else {
            // Address is not a duplicate, proceed with adding the new address
            const nwAdd = {
              houseName: req.body.houseName,
              street: req.body.street,
              district: req.body.district,
              state: req.body.state,
              pincode: req.body.pincode,
              country: req.body.country,
              phone: req.body.phone,
            };

            // Use $push to add the new address to the user's address array
            User.updateOne(
              { _id: userId },
              {
                $push: {
                  address: nwAdd,
                },
              }
            ).then((response) => {
              res.redirect("/user");
            });
          }
        }
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      next(error);
    }
  },

  
  orderview: async (req, res, next) => {
    try {
      if (req.session.user) {
        const userId = req.session.user._id;
        const orders = await Order.find({ userId: userId })
          .sort({ date: -1 })
          .populate({
            path: "productDt.items",
            populate: {
              path: "productId",
              select: "name",
            },
          });
        res.render("orders", {
          orders: orders,
        });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      next(error);
    }
  },

  //cancel order
  cancelOrder: async (req, res, next) => {
    try {
      const orderId = req.body.orderId;
      // Find the order by ID
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      if (order.status !== "placed" && order.status !== "pending") {
        return res.status(400).json({ error: "Order cannot be cancelled" });
      }

      // Check if it's an online payment order
      if (order.paymentMethod !== "COD") {
        // Add the order total price to the user's wallet
        const userId = req.session.user._id;
        const user = await User.findById(userId);
        user.wallet += order.productDt.totalprice;
        await user.save();
      }

      // Check if it's an online payment order
      if (order.paymentMethod === "COD" && order.status === "delivered") {
        // Add the order total price to the user's wallet
        const userId = req.session.user._id;
        const user = await User.findById(userId);
        user.wallet += order.productDt.totalprice;
        await user.save();
      }

      // Update the order status to "cancelled"
      order.status = "cancelled";
      await order.save();
      res.redirect("/orders"); // Redirect to the user order history page
    } catch (error) {
      next(error);
    }
  },

  wallet: async (req, res, next) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId);
      res.render("wallet", { user });
    } catch (error) {
      next(error);
    }
  },

  returnProduct: async (req, res, next) => {
    try {
      const orderId = req.body.orderId;
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }

      if (order.status !== "delivered") {
        return res.status(404).json({ error: "Order cannot be returned" });
      }

      order.status = "returned";
      await order.save();

      res.json({ message: "Order has been returned successfully" });
    } catch (error) {
      next(error);
    }
  },
};

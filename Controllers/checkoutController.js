const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");
const Cart = require("../models/Cart");
const Order = require("../Models/Order");
const Coupon = require("../models/Coupon");
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: "rzp_test_RyOx6mcc2yYfHD",
  key_secret: "dwDMlR7Le6KOCvNpqIJX6yQP",
});
const checkoutView = async (req, res, next) => {
  try {
    if (req.session.user) {
      const currentDate = Date.now();
      const coupondetails = await Coupon.find({
        expirationDate: { $gte: currentDate },
        userUsed: { $ne: req.session.user._id },
      });

      const userdetails = await User.findOne({ _id: req.session.user._id });

      const cart = await Cart.findOne({ user: userdetails._id }).populate({
        path: "product.productId",
        select: "-_id name brand price category image offer", // Include the 'offer' property in the populated product object
      });

      if (!cart || cart.product.length === 0) {
        // Render a page indicating an empty cart
        return res.render("emptyCart", { userdetails });
      }

      const products = cart.product.map((item) => {
        const product = item.productId;
        let price = product.price;
        let offerPrice = null;

        if (product.offer) {
          offerPrice = Math.round(price - (price * product.offer / 100));
        }

        // Calculate the total price for each product based on its quantity and offer (if applicable)
        const total = item.quantity * (offerPrice || price);

        return {
          name: product.name,
          brand: product.brand,
          price,
          offerPrice, // Pass the offerPrice to the view
          total,
          category: product.category,
        };
      });

      const subtotal = cart.product.reduce((acc, item) => {
        const product = item.productId;
        const price = product.offer ? Math.round(product.price - (product.price * product.offer / 100)) : product.price;
        return acc + price * item.quantity;
      }, 0);

      const total = subtotal;

      res.render("checkout", {
        userdetails,
        products,
        subtotal,
        total,
        coupondetails,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    next(error);
  }
};

const placeOrder = async (req, res, next) => {
  try {
    const userId = req.session.user._id;
    const cart = await Cart.findOne({ user: userId }).populate(
      "product.productId"
    );
    if (!cart?.product?.length) {
      return res.json({ cError: "Cart is empty" });
    }

    if (!req.body.address) {
      return res.json({ error: "Please select the address" });
    }

    if (!req.body.payment_method) {
      return res.json({ error: "Please select the payment method" });
    }

    // Calculate total price and discount price
    const subtotal = cart.product.reduce((acc, item) => {
      const product = item.productId;
      return acc + product.price * item.quantity;
    }, 0);
    
    const discount = req.body.couponDiscount || 0;
    const totalprice = discount ? subtotal - discount : subtotal;

    // Create an order
    const order = new Order({
      userId,
      address: req.body.address,
      paymentMethod: req.body.payment_method,
      status: req.body.payment_method === "COD" ? "placed" : "pending",
      productDt: {
        items: cart.product.map((item) => ({
          productId: item.productId,
          qty: item.quantity,
        })),
        totalprice,
      },
      discount,
      date: Date.now(),
    });

    await order.save();

    // Empty the cart
    await Cart.deleteOne({ user: userId });

    if (req.body.payment_method === "COD") {
      // Redirect to the success page for Cash on Delivery
      res.redirect("/success");
    } else {
      // Send the order ID to the frontend for online payment
      res.json({ online: true, order, totalprice });
    }
  } catch (error) {
    next(error);
  }
};

const userOrderView = async (req, res, next) => {
  try {
    if (req.session.user) {
      const userId = req.session.user._id;
      const user = await User.findById(userId); // Retrieve the user details
      const orders = await Order.find({ userId })
        .sort({ date: -1 })
        .populate("productDt.items.productId");
      res.render("admin/userOrder", {
        user,
        orders,
      });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    next(error);
  }
};

const successPage = async (req, res, next) => {
  try {
    res.render("cod");
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res) => {
  try {
    const User = require("./User");
    const Cart = require("./Cart");
    const Order = require("./Order");
    const user = await User.findOne({ _id: req.session.user_id });

    const cartData = await Cart.aggregate([
      { $match: { user: user._id } },
      { $unwind: "$product" },
      {
        $project: {
          productId: "$product.productId",
          price: "$product.price",
          quantity: "$product.quantity",
        },
      },
      {
        $group: {
          _id: null,
          items: {
            $push: {
              productId: "$productId",
              price: "$price",
              quantity: "$quantity",
            },
          },
          total: { $sum: { $multiply: ["$price", "$quantity"] } },
        },
      },
    ]);

    const subtotal = cartData[0].total;
    const total = req.body.amount;
    console.log(total,'totallllllllll');
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", process.env.RazorKey);
    hmac.update(
      req.body.payment.razorpay_order_id +
        "|" +
        req.body.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");

    if (hmac === req.body.payment.razorpay_signature) {
      await User.updateOne(
        { _id: req.session.user_id },
        { $inc: { wallet: -subtotal } }
      );

      const orderId = req.body.order.receipt;

      await Order.findByIdAndUpdate(orderId, { $set: { status: "COD" } });
      await Order.findByIdAndUpdate(orderId, {
        $set: { paymentId: req.body.payment.razorpay_payment_id },
      });

      await Cart.deleteOne({ user: req.session.user_id });

      res.json({ success: true });
    } else {
      await Order.findByIdAndRemove(req.body.order.receipt);
      res.json({ success: false });
    }
  } catch (error) {
    console.error(error)
    res.status(500).send('Internal Server Error');
  }
};








module.exports = {
  checkoutView,
  placeOrder,
  userOrderView,
  successPage,
  verifyPayment,
};

const Product = require("../models/Product");
const Category = require("../models/Category");
const User = require("../models/User");
const Cart = require("../models/Cart");
const { response } = require("express");

const viewCart = async (req, res) => {
  try {
    if (req.session.user) {
      const user = await User.findOne({ _id: req.session.user });
      const id = user._id;
      const cart = await Cart.findOne({ user: id });
      if (cart) {
        const cartData = await Cart.findOne({ user: id })
          .populate("product.productId")
          .lean();
        if (cartData) {
          if (cartData.product.length) {
            const Total = cartData.entirePrice;
            res.render("cart", {
              user: req.session.name,
              data: cartData.product,
              userId: id,
              total: Total,
              
            });
          } else {
            res.render("cart", { user: req.session.name, data2: "hi" });
          }
        } else {
          res.render("cart", { user: req.session.name, data2: "hi" });
        }
      } else {
        res.render("cart", {
          user: req.session.name,
          data2: "hi",
        });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};



const addtoCart = async (req, res) => {
  try {
    if (req.session.user) {
      const productId = req.params.id;
      const userName = req.session.user;
      const userdata = await User.findOne({ _id: userName });
      const userId = userdata._id;
      const productData = await Product.findById(productId);

      const userCart = await Cart.findOne({ user: userId });
      if (userCart) {
        const productExist = userCart.product.findIndex(
          (product) => product.productId == productId
        );

        if (productExist !== -1) {
          await Cart.findOneAndUpdate(
            { user: userId, "product.productId": productId },
            { $inc: { "product.$.quantity": 1 } }
          );

          res.json({ success: true });
        } else {
          userCart.product.push({
            productId: productId,
            price: productData.price,
            quantity: 1,
            totalPrice: productData.price,
          });
          userCart.entirePrice += productData.price;

          await userCart.save();
          res.json({ success: true });
        }
      } else {
        const data = new Cart({
          user: userId,
          product: [
            {
              productId: productId,
              price: productData.price,
              quantity: 1,
              totalPrice: productData.price,
            },
          ],
          entirePrice: productData.price,
        });

        await data.save();
        res.json({ success: true });
      }
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
    res.json({ success: false, error: error.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    const { id, qnty, productPrice, entirePrice } = req.body;
    let qty = parseInt(qnty);
    let minusPrice = entirePrice - productPrice * qty;

    // Find the cart and update it to remove the specific product
    const cart = await Cart.findOneAndUpdate(
      { "product.productId": id },
      {
        $pull: { product: { productId: id } },
        $set: { entirePrice: minusPrice },
      },
      { new: true } // Set { new: true } to return the updated cart
    );

    if (cart) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    res.status(500).send('Internal Server Error');
    res.json({ success: false });
  }
};
//change quantity
const changeQnty = async (req, res) => {
  try {
    const { prodId, count, price, qnty } = req.body;
    const userId = req.session.user._id;
    const existingCart = await Cart.findOne({ user: userId });
    const found = await Product.findOne({ _id: prodId });
    if (found.stock > qnty || count === -1) {
      await Cart.updateOne(
        { user: userId, "product.productId": prodId },
        { $inc: { "product.$.quantity": count } }
      );

      if (count === 1) {
        await Cart.updateOne(
          { user: userId },
          {
            $set: {
              entirePrice: existingCart.entirePrice + found.price * count,
            },
          }
        );
      } else {
        await Cart.updateOne(
          { user: userId },
          {
            $set: {
              entirePrice: existingCart.entirePrice + found.price * count,
            },
          }
        );
      }

      const cartItem = await Cart.findOne(
        { user: userId, "product.productId": prodId },
        { "product.$": 1 }
      ).lean();

      const updatedQuantity = cartItem.product[0].quantity;
      const productTotalPrice = price * updatedQuantity;
      await Cart.updateOne(
        { user: userId, "product.productId": prodId },
        { $set: { "product.$.totalPrice": productTotalPrice } }
      );

      const cart = await Cart.findOne({ user: userId }).lean();
      let sum = 0;
      for (let i = 0; i < cart.product.length; i++) {
        sum = sum + cart.product[i].totalPrice;
      }
      await User.updateOne({ _id: userId }, { carttotalprice: sum });

      res.json({ success: true, prodsingleprice: productTotalPrice, sum });
    } else {
      res.json({ stock: true });
    }
  } catch (error) {
    res.render("404", { message: error.message });
  }
};

module.exports = {
  viewCart,
  addtoCart,
  deleteCart,
  changeQnty,
};

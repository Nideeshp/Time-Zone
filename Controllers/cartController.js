const Product = require("../models/product");
const Category = require("../models/category");
const User = require("../models/user");
const Cart = require("../models/cart");
const { response } = require("express");

const viewCart = async (req, res) => {
  try {
    if (req.session.user) {
      const user = await User.findOne({ _id: req.session.user });
      const id = user._id;
      const cart = await Cart.findOne({ user: id });

      if (cart) {
        const cartData = await Cart.findOne({ user: id }).populate("product.productId").lean();

        if (cartData) {
          if (cartData.product.length) {
            // Calculate the offer price if the product has an offer
            const cartProducts = cartData.product;
            let cartTotal = 0;
            let cartSubtotal = 0;
            for (const product of cartProducts) {
              const productPrice = product.productId.price;
              const productQuantity = product.quantity;

              // Check if the product has an offer
              if (product.productId.offer) {
                const offerPrice = Math.round(productPrice - (productPrice * product.productId.offer / 100));
                product.totalPrice = offerPrice * productQuantity;
                product.offerPrice = offerPrice; // Store the offer price in the product object
                cartTotal += product.totalPrice;
                cartSubtotal += offerPrice * productQuantity;
              } else {
                product.totalPrice = productPrice * productQuantity;
                cartTotal += product.totalPrice;
                cartSubtotal += productPrice * productQuantity;
              }
            }

            res.render("cart", {
              user: req.session.name,
              data: cartProducts,
              userId: id,
              total: cartTotal,
              subtotal: cartSubtotal,
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
const changeQnty = async (req, res) => {
  try {
    const { prodId, count, price, qnty } = req.body;
    const userId = req.session.user._id;
    const existingCart = await Cart.findOne({ user: userId });
    const found = await Product.findOne({ _id: prodId });

    if (found.stock >= qnty || count === -1) {
      // Update the product quantity in the cart
      await Cart.updateOne(
        { user: userId, "product.productId": prodId },
        { $inc: { "product.$.quantity": count } }
      );

      // Update the entirePrice in the cart based on the product price and quantity change
      const updatedProductPrice = found.price * count;
      await Cart.updateOne(
        { user: userId },
        { $inc: { entirePrice: updatedProductPrice - price * qnty } }
      );

      const cartItem = await Cart.findOne(
        { user: userId, "product.productId": prodId },
        { "product.$": 1 }
      ).lean();

      const updatedQuantity = cartItem.product[0].quantity;
      const productTotalPrice = price * updatedQuantity;

      // Calculate the offer price if the product has an offer
      if (found.offer) {
        const offerPrice = Math.round(price - (price * found.offer / 100));
        await Cart.updateOne(
          { user: userId, "product.productId": prodId },
          { $set: { "product.$.totalPrice": offerPrice * updatedQuantity, "product.$.offerPrice": offerPrice } }
        );
      } else {
        // If no offer, use the original price
        await Cart.updateOne(
          { user: userId, "product.productId": prodId },
          { $set: { "product.$.totalPrice": productTotalPrice } }
        );
      }

      // Update the cart total price for the user
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

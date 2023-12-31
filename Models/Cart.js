const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const Product = require('./product')

const cartSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        ref: "IUser",
        require: true,
    },
    product: [{
        productId: {
            type: ObjectId,
            ref: Product,
            required: true,
        },
        quantity: {
            type: Number,
            default: 1
        }, 
        price: {
            type: Number,
            default: 0
        },
        totalPrice: {
            type: Number,
            default: 0
        }

    }],
    entirePrice: {
        type: Number,
        default: 0,
    }
})



const cart = mongoose.model("cart", cartSchema)
module.exports = cart

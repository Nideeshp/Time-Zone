const mongoose=require('mongoose');
const Product=require('./product');
const UserSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    location:{
        type:String,
        default:"india"
    },
    date:{
        type:Date,
        default:Date.now
    },
    blocked: {
        type: Boolean,
        default: false,
    },
    status:{
        type:Boolean,
        default:true,
    },
    wishlist:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            require:true
        }
    }],
    wallet:{
        type:Number,
        default:0
    },
    address:[
        {
            houseName:{
                type:String,
                required:true
            },
            street:{
                type:String,
                required:true
            },
            district:{
                type:String,
                required:true
            },
            state:{
                type:String,
                required:true
            },
            pincode:{
                type:String,
                required:true
            },
            country:{
                type:String,
                required:true
            },
            phone:{
                type:Number,
                required:true
            },
        }
    ],
})

const User=mongoose.model("User",UserSchema)
module.exports=User;
const mongoose=require('mongoose');
const categorySchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    offerPercent:{
        type:Number,
        default:0
    }
})

const Category=mongoose.model('Category',categorySchema)
module.exports=Category;
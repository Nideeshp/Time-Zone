const Banner=require('../Models/Banner')
const Category=require('../models/Category')



const loadBanner=async(req,res,next)=>{
    try {
        const add=await Banner.find({})
        res.render('admin/addbanner',{
            add:add
        })
    } catch (error) {
        next(error)
    }
}



module.exports={
    loadBanner
}
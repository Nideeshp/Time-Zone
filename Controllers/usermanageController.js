const User=require('../models/user')
const bcrypt=require('bcryptjs')
const Admin=require('../models/admin');
const Category = require('../models/category');

//user manage 
const loadUserMange=async(req,res)=>{
    try {
        const userData=await User.find()
        res.render('admin/usermanage',{userData})
    } catch (error) {
        console.log(error.message)
    }
}

module.exports={
    loadUserMange,
}
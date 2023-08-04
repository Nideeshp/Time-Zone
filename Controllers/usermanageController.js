const User=require('../models/user')
const bcrypt=require('bcryptjs')
const Admin=require('../models/admin');
const Category = require('../models/category');


const loadUserMange=async(req,res)=>{
    try {
        const userData=await User.find()
        res.render('admin/userManage',{userData})
    } catch (error) {
        console.log(error.message)
    }
}

module.exports={
    loadUserMange,
}
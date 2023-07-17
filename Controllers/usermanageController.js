const User=require('../models/User')
const bcrypt=require('bcryptjs')
const Admin=require('../Models/Admin');
const Category = require('../models/Category');


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
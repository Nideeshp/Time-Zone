// controllers/errorController.js

const User=require('../models/User')
const bcrypt=require('bcryptjs')
const Admin=require('../Models/Admin');
const Category = require('../models/Category');


const errorController=(req,res,next)=>{
    res.status(404).render('404',{
        pageTitle:'page not found',
        path:req.url
    })
}




module.exports={
    errorController
}

  
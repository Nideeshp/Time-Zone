// controllers/errorController.js

const User=require('../models/user')
const bcrypt=require('bcryptjs')
const Admin=require('../models/admin');
const Category = require('../models/category');


const errorController=(req,res,next)=>{
    res.status(404).render('404',{
        pageTitle:'page not found',
        path:req.url
    })
}




module.exports={
    errorController
}

  
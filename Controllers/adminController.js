const User=require('../models/User')
const bcrypt=require('bcryptjs')
const Admin=require('../Models/Admin');
const Category = require('../models/Category');


const loadLogin=async (req,res)=>{
    try{
        res.render('admin/adminLogin')
    }catch(error){
        console.log(error.message)
    }
}


const verifyLogin=async (req,res)=>{
    try{
        // console.log('bhbhbh');
        const email=req.body.email;
        const password=req.body.password;
        const adminEmail = process.env.ADMIN;
        const adminPass = process.env.ADMIN_PASSWORD

           if(email !== adminEmail && password !== adminPass){
                res.render('/admin/adminLogin',{message:"Email and password is incorrect"})
            }
           else{
            req.session.admin=true
            res.redirect('/admin/adminHome')

           }

    }catch(error){
        console.log(error.message)
    }
}


const loadDashboard=async(req,res)=>{
    try {
        res.render('admin/adminHome')
    } catch (error) {
        console.log(error.message)
    }
}







const createAdmin=async (req,res)=>{
    try {
        const {email,password}=req.body;
        const admin =new Admin({email,password});
        await admin.save();
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

const checkBlocked = async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id);
      if (user.blocked) {
        // User is blocked, redirect them to an appropriate page
        res.redirect('/blocked');
      } else {
        // User is not blocked, proceed to the next middleware or route handler
        next();
      }
    } catch (error) {
      console.log(error.message);
      res.status(500).render('error', { error: error.message });
    }
  };
  
  
  



// Controller function to block a user
const blockUser = async (req, res) => {
    const userId = req.params.id;



    
  
    try {
      await User.updateOne({ _id: userId }, { $set: { blocked: true } });
      res.json({ block: true });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error:'Something went wrong'});
    }
  };
  

  // Controller function to unblock a user
  const unblockUser = async (req, res) => {
    const userId = req.params.id;
  
    try {
      await User.updateOne({ _id: userId }, { $set: { blocked: false } });
      res.json({ unblock: true });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ error: 'Something went wrong' });
    }
  };
  

module.exports={
    loadLogin,
    verifyLogin,
    loadDashboard,
    createAdmin,
    blockUser,
    unblockUser,
    checkBlocked
}
const verifyUser=async(req,res,next)=>{
    try{
       if(req.session.loggedIn){
        console.log(req.session.loggedIn);
        next()
       }else{
        res.redirect('/login');
       }  
    }
    catch(error){
        console.log(error.message);
    }
}

const logout=async(req,res,next)=>{
  try {
   if(req.session.user){
    req.session.user=null
    req.session.loggedIn=false;
    res.redirect('back')
   } 
  } catch (error) {
    next(error);
  }
  }

module.exports={
    verifyUser,
    logout
}

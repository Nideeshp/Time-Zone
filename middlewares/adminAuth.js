const isLogin = async (req, res, next) => {
    try {
      if (req.session.admin) {
        next();
      } else {
        res.redirect('/admin/adminLogin');
      }
    } catch (error) {
      console.log(error.message);
      res.redirect('/admin/adminLogin');
    }
  };
  
  const isLogout = async (req, res, next) => {
    try {
      if (req.session.admin) {
        res.redirect('/admin/adminHome'); // or any other dashboard/home page
      } else {
        next();
      }
    } catch (error) {
      console.log(error.message);
      next();
    }
  };
  
  module.exports = {
    isLogin,
    isLogout,
  };
  
const User = require('../models/user');

const verifyUser = async (req, res, next) => {
  try {
    if (req.session.loggedIn && req.session.user ) {
      const user = await User.findById(req.session.user._id);
      if (user.blocked) {
        // User is blocked, redirect them to an appropriate page or logout
        req.session.user = null;
        req.session.loggedIn = false;
        return res.redirect('/login');
      }
      next();
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.log(error.message);
  }
};

const logout = async (req, res, next) => {
  try {
    console.log('object');
    if (req.session.user) {
      req.session.user = null;
      req.session.loggedIn = false;
      res.redirect('back');
    }else {
      console.log('2');
      next();
    }
  } catch (error) {
    
  }
};

module.exports = {
  verifyUser,
  logout,
};

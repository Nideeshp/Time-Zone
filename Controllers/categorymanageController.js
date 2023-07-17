const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Admin = require('../Models/Admin');
const Category = require('../models/Category');


//loadcategory manage
const loadcategoryManage = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render('admin/categoryManage', { categories,message :''});
  } catch (error) {
    console.log(error.message);
  }
};
const loadaddCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Convert the name to lowercase for case-insensitive comparison
    const lowerCaseName = name.toLowerCase();

    // Check if the category name already exists (case-insensitive)
    const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${lowerCaseName}$`, 'i') } });
    if (existingCategory) {
      const categories = await Category.find();
      const message = 'Category already exists';
      return res.render('admin/categoryManage', { categories, message });
    }

    // Create a new category
    const category = new Category({ name, description });
    const savedCategory = await category.save();

    if (savedCategory) {
      const categories = await Category.find();
      const message = 'Category added';
      return res.render('admin/categoryManage', { categories, message });
    } else {
      const categories = await Category.find();
      const message = 'Action failed';
      return res.render('admin/categoryManage', { categories, message });
    }
  } catch (error) {
    next(error);
  }
};

//loadedit category
const loadeditCategory=async(req,res,next)=>{
  try {
    const id=req.params.id
    const details=await Category.findOne({_id:id})
    const main=details.id;
    res.render('admin/editcategory',{details:details,main:main})
  } catch (error) {
    next(error)
  }
}

const editedCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id },
      { $set: { name: req.body.name, description: req.body.description } },
      { new: true }
    );

    if (updatedCategory) {
      res.redirect('/admin/categoryManage',);
    } else {
      res.render('admin/editcategory', { message: 'Failed to update category' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loadcategoryManage,
  loadaddCategory,
  loadeditCategory,
  editedCategory
};





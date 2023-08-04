const User = require("../models/user");
const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const Category = require("../models/category");





//loadcategory manage
const loadcategoryManage = async (req, res) => {
  try {
    const categories = await Category.find();
    res.render("admin/categorymanage", { categories, message: "" });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};







//load add category
const loadaddCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const Name = req.body.name.trim();
    const Des = req.body.description.trim();

    if (!Name || !Des) {
      return res
        .status(400)
        .send("Something you entered is empty please check it.");
    }

    const lowerCaseName = Name.toLowerCase(); 

    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${lowerCaseName}$`, "i") },
    });
    if (existingCategory) {
      const categories = await Category.find();
      const message = "Category already exists";
      return res.render("admin/categorymanage", { categories, message });
    }

    // Create a new category
    const category = new Category({ name, description });
    const savedCategory = await category.save();

    if (savedCategory) {
      const categories = await Category.find();
      const message = "Category added";
      return res.render("admin/categorymanage", { categories, message });
    } else {
      const categories = await Category.find();
      const message = "Action failed";
      return res.render("admin/categorymanage", { categories, message });
    }
  } catch (error) {
    next(error);
  }
};






//loadedit category
const loadeditCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const details = await Category.findOne({ _id: id });
    const main = details.id;
    res.render("admin/editcategory", { details: details, main: main });
  } catch (error) {
    next(error);
  }
};








//edited category
const editedCategory = async (req, res, next) => {
  try {
    const id = req.params.id;
    const {name,description,offerPercent}=req.body

    const updatedCategory = await Category.findOneAndUpdate(
      { _id: id },
      { $set: { name,description,offerPercent } },
      { new: true }
    );

    if (updatedCategory) {
      res.redirect("/admin/categorymanage");
    } else {
      res.render("admin/editcategory", {
        message: "Failed to update category",
      });
    }
  } catch (error) {
    next(error);
  }
};






module.exports = {
  loadcategoryManage,
  loadaddCategory,
  loadeditCategory,
  editedCategory,
};

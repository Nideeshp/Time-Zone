const User = require('../models/User');
const bcrypt = require('bcryptjs');
const Admin = require('../Models/Admin');
const Category = require('../models/Category');
const Product = require('../models/Product');

const fs=require('fs')
const path=require('path')


// View for the product page


const loadProduct = async (req, res) => {
  try {
    const products = await Product.find().populate('category')
    res.render('admin/productManage', { products: products });
  } catch (error) {
    console.log(error.message);
  }
};


// View for the add product page
const loadaddProduct = async (req, res) => {
  try {
    const categoryData=await Category.find({});
    res.render('admin/addProduct',{categoryData:categoryData});
  } catch (error) {
    console.log(error.message);
  }
};



const insertProduct = async (req, res, next) => {
  try {
    const images = [];

    // Validate image file types
    for (const file of req.files) {
      if (!isValidImageFile(file)) {
        return res.status(400).send('Invalid image file type');
      }
      images.push(file.filename);
    }

    

 const products=new Product({
  name:req.body.name,
  description:req.body.description,
  brand:req.body.brand,
  image:images,
  price:req.body.price,
  stock:req.body.stock,
  category:req.body.category
})
const categoryData=await products.save()
if(categoryData){
  res.redirect('productManage')
}



  } catch (error) {
    next(error);
  }
};

// Function to validate image file types
const isValidImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  return allowedTypes.includes(file.mimetype);
};





//delete product
const deleteProduct=async(req,res,next)=>{
  try {
    const id=req.params.id;
    await Product.deleteOne({_id:id})
    res.redirect('/admin/productManage')
  } catch (error) {
    next(error)
  }
}


//loadeditproductpage
const loadeditProduct = async (req, res, next) => {
  console.log('called');
  try {

    const id = req.params.id;
    console.log(id);
    const details1 = await Product.findOne({ _id: id }).populate('category').exec();
    const details = await Product.findOne({ _id: id });
    const main = details1._id;
    const catData = await Category.find({ categoryName: details1.category.categoryName });
    const categoryData = await Category.find({});
    console.log(catData);
    res.render('admin/editProduct', { details: details, categoryData: categoryData, main: main, catData: catData });
  } catch (error) {
    next(error);
  }
};

const editProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log(id);
    await Product.updateOne({ _id: id }, {
      $set: {
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        category: req.body.category,
        stock: req.body.stock,
        brand: req.body.brand
      }
    });
    res.redirect('/admin/productManage');
  } catch (error) {
    next(error);
  }
};


const loadEditImage = async (req, res, next) => {
  try {
    const imagedata = req.files;
    const proId = req.params.id;
    const images = [];
    imagedata.forEach((element) => {
      images.push(element.filename);
    });

    const product = await Product.findById(proId);
    const existingImages = product.image;

    const updatedImages = existingImages.concat(images);

    await Product.findByIdAndUpdate(proId, { image: updatedImages });
    res.redirect('/admin/editProduct/' + proId);
  } catch (error) {
    next(error);
  }
};



//delete product image individually
const deleteProductImage = async (req, res, next) => {
  try {
    const imgId = req.params.imgId;
    const proId = req.params.id;
    fs.unlink(path.join(__dirname, '../public/uploads', imgId), () => {});
    await Product.updateOne({ _id: proId }, { $pull: { image: imgId } });
    res.redirect('/admin/editProduct/' + proId);
  } catch (error) {
    next(error);
  }
};


const softDelete = async (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    product.deleted = !product.deleted; // Toggle the deleted status

    const updatedProduct = await product.save();
    if (updatedProduct) {
      res.redirect('/admin/productManage');
    } else {
      res.render('admin/productManage', { message: 'Failed to update product' });
    }
  } catch (error) {
    next(error);
  }
};




module.exports = {
  loadProduct,
  loadaddProduct,
  insertProduct,
  deleteProduct,
  loadeditProduct,
  editProduct,
  softDelete,
  loadEditImage,
  deleteProductImage
};

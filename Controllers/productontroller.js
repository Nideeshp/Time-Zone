const User = require('../models/user');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin');
const Category = require('../models/category');
const Product = require('../models/product');

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

    // Trim the input values
    const productName = req.body.name.trim();
    const description = req.body.description.trim();
    const brand = req.body.brand.trim()
    const price = parseFloat(req.body.price);
    const stock = parseFloat(req.body.stock)
    
    // Check if the name and description are not empty after trimming
    if (!productName || !description || !brand) {
      return res.status(400).send('Something you entered is empty please check it.');
    }

    if(isNaN(price)||price<=0){
      return res.status(400).send('Something in your price')
    }

    if(isNaN(stock)||stock<=0){
      return res.status(400).send("Something in your stock")
    }

    // if(isNaN(offer)||offer<=0){
    //   return res.status(400).send("Something in your offer")
    // }


    const products = new Product({
      name: productName,
      description: description,
      brand: req.body.brand,
      image: images,
      price: req.body.price,
      stock: req.body.stock,
      category: req.body.category,
    });

    const categoryData = await products.save();
    if (categoryData) {
      res.redirect('productManage');
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


const loadeditProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const product = await Product.findOne({ _id: id }).populate('category').exec();
    const catData = await Category.find({});
    const categoryData = await Category.find({});
    res.render('admin/editProduct', { product: product, categoryData: categoryData, catData: catData });
  } catch (error) {
    next(error);
  }
};



const editProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { name, price, description, category, stock, brand, offer } = req.body;
    await Product.updateOne({ _id: id }, {
      $set: {
        name: name,
        price: price,
        description: description,
        category: category,
        stock: stock,
        brand: brand,
        offer: offer
      }
    }).then((resp) => console.log(resp))
    // Handle the offer logic
    const product=await Product.findOne({})
    if(product.offerApplied){
      let newPrice = price;
    if (offer > 0) {
      newPrice = Math.round(price - (price * offer / 100));
      await Product.updateOne({_id:id},{
        $set:{
          offerPrice:newPrice,
        }
      })
    }
    }
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

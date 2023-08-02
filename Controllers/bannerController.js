const Banner = require("../Models/Banner");
const Category = require("../models/Category");

const loadBanner = async (req, res, next) => {
  try {
    const add = await Banner.find({});
    res.render("admin/addbanner", {
      add: add,
    });
  } catch (error) {
    next(error);
  }
};

const addAds = async (req, res, next) => {
  try {
    const categoryData = await Category.find({});
    res.render("admin/addview", {
      categoryData: categoryData,
    });
  } catch (error) {
    next(error);
  }
};

const insertAds = async (req, res, next) => {
  try {
    const images = [];
    for (file of req.files) {
      images.push(file.filename);
    }
    const add = new Banner({
      name: req.body.head,
      description: req.body.description,
      image: images,
    });
    const added = await add.save();
    if (added) {
      res.redirect("/admin/ads");
    } else {
      res.render("admin/addview", { message: "action failed" });
    }
  } catch (error) {
    next(error);
  }
};

const loadEditBanner = async (req, res, next) => {
  try {
    const id = req.params.id;
    const details = await Banner.find({ _id: id });
    res.render("admin/editads", { details: details });
  } catch (error) {
    next(error);
  }
};

const saveEditBanner = async (req, res, next) => {
  try {
    const id = req.params.id;
    const images = [];
    for (file of req.files) {
      images.push(file.filename);
    }
    if (req.files == 0) {
      const id = req.params.id;
      await Banner.updateOne(
        { _id: id },
        {
          $set: {
            name: req.body.name,
            description: req.body.description,
          },
        }
      );
      res.redirect("/admin/ads");
    } else {
      await Banner.updateOne(
        { _id: id },
        {
          $set: {
            name: req.body.head,
            description: req.body.description,
            image: images,
          },
        }
      );
      res.redirect("/admin/ads");
    }
  } catch (error) {
    next(error);
  }
};

const deleteAdd = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Banner.deleteOne({ _id: id });
    res.redirect("/admin/ads");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loadBanner,
  addAds,
  insertAds,
  loadEditBanner,
  saveEditBanner,
  deleteAdd,
};

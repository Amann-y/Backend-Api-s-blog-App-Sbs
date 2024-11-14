const { CategoryModel } = require("../Models/category");

const createCategory = async (req, res) => {
  const { _id: id } = req.user;
  try {
    const { category, imgUrl } = req.body;
    if (!category || !imgUrl) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const data = await CategoryModel.create({
      category,
      imgUrl,
      createdBy: id,
    });

    if (data) {
      return res.status(201).json({
        message: "Category Created Successfully",
        success: true,
        data,
      });
    } else {
      return res.status(401).json({
        message: "Something went wrong!, Try again",
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllCategories = async (req, res) => {
  try {
    const categories = await CategoryModel.find({});
    if (categories) {
      return res.status(200).json({
        success: true,
        categories,
      });
    } else {
      return res.status(401).json({
        message: "No data found",
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCategoryOfSpecificUser = async (req, res) => {
  try {
    const categories = await CategoryModel.find({ createdBy: req.user._id });
    if (categories) {
      return res.status(200).json({
        success: true,
        categories,
      });
    } else {
      return res.status(401).json({
        message: "No data found",
        success: false,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteSpecificCategoryOfUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const categories = await CategoryModel.find({ createdBy: req.user._id, _id: id  });
    if (categories.length > 0) {
      const output = await CategoryModel.findByIdAndDelete(id);
      if (output) {
        return res
          .status(200)
          .json({ success: true, message: "Category Deleted Successfully" });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category id" });
      }
    } else {
      res
        .status(500)
        .json({ success: false, message: "Unauthorized Person! or Invalid category id, Try Again" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSpecificCategoryOfUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, imgUrl } = req.body;
   
    if (!category || !imgUrl) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const categories = await CategoryModel.find({ createdBy: req.user._id, _id:id });

    if (categories.length > 0) {
      const output = await CategoryModel.findByIdAndUpdate(
        id,
        {
          category,
          imgUrl,
        },
        { new: true }
      );
      if (output) {
        return res
          .status(200)
          .json({ success: true, message: "Category updated Successfully" });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid category id" });
      }
    } else {
      res
        .status(500)
        .json({ success: false, message: "Unauthorized Person or Invalid category id!, Try Again" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryOfSpecificUser,
  deleteSpecificCategoryOfUser,
  updateSpecificCategoryOfUser,
};


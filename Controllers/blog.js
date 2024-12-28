const { BlogModel } = require("../Models/blog");
const mongoose = require("mongoose"); // Make sure mongoose is required
const { UserModel } = require("../Models/user");

const createBlog = async (req, res) => {
  const { title, description, categoryTitle } = req.body;
  const { fullName, email, _id: id } = req.user;

  try {
    // Validate that required fields are provided
    if (!title || !description || !categoryTitle) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate that an image file is provided
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Upload the blog image" });
    }

    // Check if the uploaded file is an image (optional validation)
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image type. Allowed types: jpeg, png, jpg.",
      });
    }

    // Check the file size (limit to 500KB)
    const maxSize = 500 * 1024; // 500KB
    if (req.file.size > maxSize) {
      return res
        .status(400)
        .json({ success: false, message: "File size exceeds limit (500KB)" });
    }

    // Convert image buffer to base64 (optional)
    const photoBase24 = req.file.buffer.toString("base64");

    // Create new blog document
    const newBlog = await BlogModel.create({
      title,
      imgUrl: photoBase24, // Save image in base64 format (or you can save a file path here instead)
      description,
      nameOfCreator: fullName,
      emailOfCreator: email,
      createdBy: id,
      categoryTitle,
    });

    if (newBlog) {
      res
        .status(201)
        .json({ success: true, message: "Blog created successfully", newBlog });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Something went wrong, try again!" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error?.message });
  }
};

const getAllBlog = async (req, res) => {
  try {
    const blogs = await BlogModel.find({});

    if (blogs) {
      res.status(200).json({ success: true, blogs });
    } else {
      res.status(404).json({
        success: true,
        message: "Something went wrong, No blog found",
      });
    }
  } catch (error) {
    res.status(500).json({ success: true, message: error.message });
  }
};

const getUserSpecificBlog = async (req, res) => {
  try {
    const { _id: id } = req.user;

    const blogs = await BlogModel.find({ createdBy: id });
    if (blogs) {
      res.status(200).json({ success: true, blogs });
    } else {
      res.status(404).json({
        success: false,
        message: "Something went wrong, No blog found",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteUserSpecificBlog = async (req, res) => {
  try {
    const { _id } = req.user;
    const { id } = req.params;

    const userBlog = await BlogModel.find({ createdBy: _id, _id: id });

    if (userBlog.length > 0) {
      const blog = await BlogModel.findByIdAndDelete(id);
      if (blog) {
        res
          .status(200)
          .json({ success: true, message: "Blog deleted successfully" });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Something went wrong" });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "User is not authorized to delete the blog",
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserSpecificBlog = async (req, res) => {
  try {
    const { _id, fullName, email } = req.user;
    let { id } = req.params; // The blog ID to update
    const { title, description, categoryTitle } = req.body;

    // Sanitize and validate the id
    id = id.trim(); // Remove any extraneous whitespace or newline characters

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blog ID" });
    }

    // Validate input fields
    if (!title || !description || !categoryTitle) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate that an image file is provided
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Select the blog image" });
    }

    // Check if the uploaded file is an image (optional validation)
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: "Invalid image type. Allowed types: jpeg, png, jpg.",
      });
    }

    // Check the file size (limit to 500KB)
    const maxSize = 500 * 1024; // 500KB
    if (req.file.size > maxSize) {
      return res
        .status(400)
        .json({ success: false, message: "File size exceeds limit (500KB)" });
    }

    // Convert image buffer to base64 (optional)
    const photoBase24 = req.file.buffer.toString("base64");

    // Find the blog to update
    const userBlog = await BlogModel.findOne({ createdBy: _id, _id: id });

    if (userBlog) {
      const blog = await BlogModel.findByIdAndUpdate(
        id,
        {
          title,
          imgUrl: photoBase24,
          description,
          nameOfCreator: fullName,
          emailOfCreator: email,
          createdBy: _id,
          categoryTitle,
        },
        { new: true }
      );

      if (blog) {
        res
          .status(200)
          .json({ success: true, message: "Blog updated successfully", blog });
      } else {
        res.status(404).json({ success: false, message: "Blog not found" });
      }
    } else {
      res.status(403).json({
        success: false,
        message: "User is not authorized to update this blog",
      });
    }
  } catch (error) {
    // console.error(error)
    res.status(500).json({ success: false, message: error.message });
  }
};

const getBlogByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const blogs = await BlogModel.find({
      categoryTitle: { $regex: new RegExp(category, "i") },
    });
    if (blogs.length > 0) {
      res.status(200).json({ success: true, blogs });
    } else {
      res.status(404).json({ success: false, message: "No blog found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const likeABlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blog ID" });
    }

    // Find the blog to like it
    const userBlog = await BlogModel.findOne({ _id: id });

    if (!userBlog?.likes?.includes(_id)) {
      const result = await BlogModel.findByIdAndUpdate(
        id,
        {
          $push: {
            likes: _id,
          },
        },
        { new: true }
      );

      if (result) {
        res.status(201).json({
          success: true,
          message: "Blog has been Liked",
          likes: result,
        });
      }
    } else {
      const result = await BlogModel.findByIdAndUpdate(
        id,
        {
          $pull: {
            likes: _id,
          },
        },
        { new: true }
      );

      if (result) {
        res.status(201).json({
          success: true,
          message: "Blog has been DisLiked",
          likes: result,
        });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllLikes = async (req, res) => {
  const { postId } = req.params; // Assuming you pass postId in the route parameters

  try {
    const blogPost = await BlogModel.findById(postId).populate(
      "likes",
      "nameOfCreator emailOfCreator"
    );

    if (!blogPost) {
      return res
        .status(404)
        .json({ success: false, message: "Blog post not found" });
    }

    const likesResponse = blogPost.likes;

    res.status(200).json({ success: true, likes: likesResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const view = async (req, res) => {
  try {
    const { blogId } = req.params;
    const { _id } = req.user;

    if (!mongoose.Types.ObjectId.isValid(blogId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blog ID" });
    }

    const userBlog = await BlogModel.findOne({ _id: blogId });
    const loginUser = await UserModel.findById(_id);

    if (!userBlog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found" });
    }

    if (loginUser.isVerified) {
      userBlog.views += 1;
      await userBlog.save();
      return res.status(200).json({ success: true, message: null });
    } else {
      return res
        .status(403)
        .json({ success: false, message: "User is not verified" });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const saveBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id } = req.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blog ID" });
    }

    // Find the blog to save it
    const userBlog = await UserModel.findOne({ _id });

    if (!userBlog?.saveBlogs?.includes(id)) {
      const result = await UserModel.findByIdAndUpdate(
        _id,
        {
          $push: {
            saveBlogs: id,
          },
        },
        { new: true }
      ).select("saveBlogs");

      if (result) {
        res.status(201).json({
          success: true,
          message: "Blog saved successfully",
          result,
        });
      }
    } else {
      const result = await UserModel.findByIdAndUpdate(
        _id,
        {
          $pull: {
            saveBlogs: id,
          },
        },
        { new: true }
      ).select("saveBlogs");

      if (result) {
        res.status(201).json({
          success: true,
          message: "Blog unsaved",
          result,
        });
      }
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getSavedBlog = async (req, res) => {
  try {
    const { _id } = req.user;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blog ID" });
    }

    const savedBlog = await UserModel.findOne({ _id });
    if (!savedBlog) {
      return res
        .status(404)
        .json({ success: false, message: "No saved blog found" });
    } else {
      const { saveBlogs } = savedBlog;
      return res.status(200).json({ success: true, saveBlogs });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const searchBlogs = async (req, res) => {
  try {
    const { search } = req.query;
    const blogs = await BlogModel.find({
      $or: [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { categoryTitle: { $regex: search, $options: "i" } },
      ],
    });

    if (blogs.length <= 0) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Make sure all words are spelled correctly, Try different keywords",
        });
    }

    return res.status(200).json({success:true, blogs})
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createBlog,
  getAllBlog,
  getUserSpecificBlog,
  deleteUserSpecificBlog,
  updateUserSpecificBlog,
  getBlogByCategory,
  likeABlog,
  getAllLikes,
  view,
  saveBlog,
  getSavedBlog,
  searchBlogs,
};

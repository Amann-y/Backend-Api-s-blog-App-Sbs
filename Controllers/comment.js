const { CommentModel } = require("../Models/comment");

const createComment = async (req, res) => {
  try {
    const { comment, blogId } = req.body;
    const { _id, fullName, email } = req.user;

    if (!comment || !blogId) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required!" });
    }

    const newComment = await CommentModel.create({
      userName: fullName,
      comment,
      createdBy: _id,
      blogId,
    });

    if (newComment) {
      res
        .status(201)
        .json({ success: true, newComment, message: "Comment added" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllComments = async (req, res) => {
  try {
    const comments = await CommentModel.find({});
    if (comments.length > 0) {
      res.status(200).json({ success: true, comments });
    } else {
      res.status(404).json({ success: false, message: "No comment found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const editComment = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id } = req.params;

    const { comment } = req.body;
    if (!comment) {
      return res
        .status(400)
        .json({ success: false, message: "Comment shouldn't be empty" });
    }

    const userComment = await CommentModel.find({ createdBy: userId, _id: id });

    if (userComment.length > 0) {
      const newComment = await CommentModel.findByIdAndUpdate(
        id,
        {
          comment,
        },
        { new: true }
      );

      if (newComment) {
        res
          .status(201)
          .json({ success: true, newComment, message: "Comment updated" });
      }
    } else {
      res.status(400).json({ success: false, message: "Unauthorized User" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { id } = req.params;

    const userComment = await CommentModel.find({ createdBy: userId, _id: id });

    if (userComment.length > 0) {
      const newComment = await CommentModel.findByIdAndDelete(id);

      if (newComment) {
        res.status(201).json({
          success: true,
          message: "Comment deleted successfully",
        });
      }
    } else {
      res.status(400).json({ success: false, message: "Unauthorized User" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCommentsFromABlog = async (req, res) => {
  try {
    const { blogId } = req.params;

    const comments = await CommentModel.find({ blogId });

    if (comments.length > 0) {
      res.status(200).json({ success: true, comments });
    } else {
      res.status(404).json({ success: false, message: "No comment found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createComment,
  getAllComments,
  editComment,
  deleteComment,
  getCommentsFromABlog,
};
